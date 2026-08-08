import http from "http";
import request from "supertest";

import { createChain, type MockDb } from "../helpers/mock-db";

jest.mock("next/headers", () => ({
  headers: jest.fn().mockResolvedValue(new Headers()),
}));

jest.mock("@/lib/auth", () => ({
  auth: { api: { getSession: jest.fn() } },
}));

jest.mock("@/db", () => {
  const actual = jest.requireActual("@/db");
  return {
    ...actual,
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
    },
  };
});

jest.mock("@/lib/gemini", () => ({
  GEMINI_CHAT_MODEL: "gemini-2.5-flash",
}));

jest.mock("@/modules/intelligence/lib/search-transcript", () => ({
  searchTranscript: jest.fn(),
}));

jest.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: jest.fn(() => jest.fn(() => ({ modelId: "mock-model" }))),
}));

jest.mock("ai", () => ({
  convertToModelMessages: jest.fn(async (messages: unknown) => messages),
  streamText: jest.fn(),
}));

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { searchTranscript } from "@/modules/intelligence/lib/search-transcript";
import { streamText } from "ai";
import { POST } from "@/app/api/meetings/[meetingId]/chat/route";

const mockDb = db as unknown as MockDb;
const mockGetSession = auth.api.getSession as jest.Mock;
const mockSearchTranscript = searchTranscript as jest.Mock;
const mockStreamText = streamText as jest.Mock;

/**
 * Next.js route handlers are plain functions over the Fetch `Request`/`Response`
 * types, not Express middleware — this wraps `POST` in a bare http.Server so
 * supertest has something to hit, without any real network I/O.
 */
function buildServer(meetingId: string) {
  return http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      void (async () => {
        const body = Buffer.concat(chunks).toString();
        const webRequest = new Request(`http://localhost/api/meetings/${meetingId}/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
        });

        const response = await POST(webRequest, {
          params: Promise.resolve({ meetingId }),
        });

        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        const text = await response.text();
        res.end(text);
      })();
    });
  });
}

const authedSession = {
  user: { id: "user_1", name: "Test User", email: "test@example.com" },
};

const userMessage = (text: string) => ({
  messages: [{ id: "1", role: "user", parts: [{ type: "text", text }] }],
});

describe("POST /api/meetings/[meetingId]/chat", () => {
  const meetingId = "meeting_1";

  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await request(buildServer(meetingId))
      .post(`/api/meetings/${meetingId}/chat`)
      .send(userMessage("hi"));

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });

  it("returns 404 when the meeting isn't owned by the caller", async () => {
    mockGetSession.mockResolvedValue(authedSession);
    mockDb.select.mockReturnValue(createChain([]));

    const response = await request(buildServer(meetingId))
      .post(`/api/meetings/${meetingId}/chat`)
      .send(userMessage("hi"));

    expect(response.status).toBe(404);
  });

  it("returns 400 for an empty message", async () => {
    mockGetSession.mockResolvedValue(authedSession);
    mockDb.select.mockReturnValue(createChain([{ id: meetingId, title: "Standup" }]));

    const response = await request(buildServer(meetingId))
      .post(`/api/meetings/${meetingId}/chat`)
      .send(userMessage("   "));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/empty/i);
  });

  it("returns 400 when the message exceeds the length cap", async () => {
    mockGetSession.mockResolvedValue(authedSession);
    mockDb.select.mockReturnValue(createChain([{ id: meetingId, title: "Standup" }]));

    const response = await request(buildServer(meetingId))
      .post(`/api/meetings/${meetingId}/chat`)
      .send(userMessage("a".repeat(2001)));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/too long/i);
  });

  it("accepts a message right at the length cap", async () => {
    mockGetSession.mockResolvedValue(authedSession);
    mockDb.select.mockReturnValue(createChain([{ id: meetingId, title: "Standup" }]));
    mockSearchTranscript.mockResolvedValue([]);
    mockDb.insert.mockReturnValue(createChain([{ id: "msg_1" }]));
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response("ok", { status: 200 }),
    });

    const response = await request(buildServer(meetingId))
      .post(`/api/meetings/${meetingId}/chat`)
      .send(userMessage("a".repeat(2000)));

    expect(response.status).toBe(200);
  });

  it("returns 500 and never persists the user message when transcript search fails", async () => {
    mockGetSession.mockResolvedValue(authedSession);
    mockDb.select.mockReturnValue(createChain([{ id: meetingId, title: "Standup" }]));
    mockSearchTranscript.mockRejectedValue(new Error("vector search failed"));

    const response = await request(buildServer(meetingId))
      .post(`/api/meetings/${meetingId}/chat`)
      .send(userMessage("hi"));

    expect(response.status).toBe(500);
    expect(response.body.error).toBeDefined();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("deletes the persisted user message when streamText setup throws", async () => {
    mockGetSession.mockResolvedValue(authedSession);
    mockDb.select.mockReturnValue(createChain([{ id: meetingId, title: "Standup" }]));
    mockSearchTranscript.mockResolvedValue([]);
    mockDb.insert.mockReturnValue(createChain([{ id: "msg_1" }]));
    mockDb.delete.mockReturnValue(createChain([]));
    mockStreamText.mockImplementation(() => {
      throw new Error("model unavailable");
    });

    const response = await request(buildServer(meetingId))
      .post(`/api/meetings/${meetingId}/chat`)
      .send(userMessage("hi"));

    expect(response.status).toBe(500);
    expect(response.body.error).toBeDefined();
    expect(mockDb.delete).toHaveBeenCalledTimes(1);
  });

  it("streams a response on success", async () => {
    mockGetSession.mockResolvedValue(authedSession);
    mockDb.select.mockReturnValue(createChain([{ id: meetingId, title: "Standup" }]));
    mockSearchTranscript.mockResolvedValue([
      { id: "chunk_1", content: "We discussed the roadmap.", speakerName: "Alice" },
    ]);
    mockDb.insert.mockReturnValue(createChain([{ id: "msg_1" }]));
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: () =>
        new Response("mock-stream", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }),
    });

    const response = await request(buildServer(meetingId))
      .post(`/api/meetings/${meetingId}/chat`)
      .send(userMessage("What did we discuss?"));

    expect(response.status).toBe(200);
    expect(response.text).toBe("mock-stream");
    expect(mockStreamText).toHaveBeenCalledTimes(1);
  });
});
