import { createChain, type MockDb } from "../helpers/mock-db";

jest.mock("@/db", () => {
  const actual = jest.requireActual("@/db");
  return {
    ...actual,
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

jest.mock("@/lib/auth", () => ({
  auth: { api: { getSession: jest.fn() } },
}));

jest.mock("@/lib/stream-video", () => ({
  streamVideo: {
    upsertUsers: jest.fn(),
    video: {
      call: jest.fn(() => ({
        getOrCreate: jest.fn(),
        update: jest.fn(),
        listRecordings: jest.fn(),
      })),
    },
    generateUserToken: jest.fn(),
  },
}));

import { db } from "@/db";
import { meetingsRouter } from "@/modules/meetings/server/procedures";
import { createCallerFactory, type createTRPCContext } from "@/trpc/init";

const mockDb = db as unknown as MockDb;
const createCaller = createCallerFactory(meetingsRouter);

type Ctx = Awaited<ReturnType<typeof createTRPCContext>>;

const authedCtx = (userId = "user_1"): Ctx =>
  ({
    userId,
    session: {
      user: { id: userId, name: "Test User", email: "test@example.com", image: null },
    },
  }) as unknown as Ctx;

const anonCtx: Ctx = { userId: null, session: null };

const validMeetingInput = {
  title: "Sprint planning",
  description: "Plan the next sprint",
  date: "2026-01-01",
  time: "10:00",
  duration: 30,
  participants: ["a@example.com"],
};

describe("meetings.create", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = createCaller(anonCtx);
    await expect(caller.create(validMeetingInput)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects a missing title", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      caller.create({ ...validMeetingInput, title: "" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an invalid participant email", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      caller.create({ ...validMeetingInput, participants: ["not-an-email"] })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a duration outside the allowed range", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      caller.create({ ...validMeetingInput, duration: 1000 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an empty participants list", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      caller.create({ ...validMeetingInput, participants: [] })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws NOT_FOUND when the referenced agent is inaccessible", async () => {
    mockDb.select.mockReturnValue(createChain([]));

    const caller = createCaller(authedCtx());
    await expect(
      caller.create({ ...validMeetingInput, agentId: "agent_missing" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("creates a meeting on valid input", async () => {
    const createdRow = { id: "meeting_1", title: validMeetingInput.title, userId: "user_1" };
    mockDb.insert.mockReturnValue(createChain([createdRow]));

    const caller = createCaller(authedCtx());
    const result = await caller.create(validMeetingInput);

    expect(result).toEqual(createdRow);
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });

  it("creates a meeting with an accessible agent", async () => {
    mockDb.select.mockReturnValue(createChain([{ id: "agent_1" }]));
    const createdRow = { id: "meeting_2", title: validMeetingInput.title, agentId: "agent_1" };
    mockDb.insert.mockReturnValue(createChain([createdRow]));

    const caller = createCaller(authedCtx());
    const result = await caller.create({ ...validMeetingInput, agentId: "agent_1" });

    expect(result).toEqual(createdRow);
  });
});

describe("meetings.getMany", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = createCaller(anonCtx);
    await expect(caller.getMany()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns the meeting list with no filters", async () => {
    const rows = [{ id: "meeting_1", title: "Standup" }];
    mockDb.select.mockReturnValue(createChain(rows));

    const caller = createCaller(authedCtx());
    const result = await caller.getMany();

    expect(result).toEqual(rows);
  });

  it("accepts a search term", async () => {
    const rows = [{ id: "meeting_1", title: "Standup" }];
    mockDb.select.mockReturnValue(createChain(rows));

    const caller = createCaller(authedCtx());
    const result = await caller.getMany({ search: "standup" });

    expect(result).toEqual(rows);
  });

  it("accepts upcoming/past filters", async () => {
    mockDb.select.mockReturnValue(createChain([]));
    const caller = createCaller(authedCtx());

    await expect(caller.getMany({ filter: "upcoming" })).resolves.toEqual([]);
    await expect(caller.getMany({ filter: "past" })).resolves.toEqual([]);
  });

  it("rejects an invalid filter value", async () => {
    const caller = createCaller(authedCtx());
    await expect(
      // @ts-expect-error intentionally invalid enum value
      caller.getMany({ filter: "invalid" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts a duration filter", async () => {
    mockDb.select.mockReturnValue(createChain([]));
    const caller = createCaller(authedCtx());
    await expect(
      caller.getMany({ durationFilter: "short" })
    ).resolves.toEqual([]);
  });
});

describe("meetings.remove", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = createCaller(anonCtx);
    await expect(caller.remove({ id: "meeting_1" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects an empty id", async () => {
    const caller = createCaller(authedCtx());
    await expect(caller.remove({ id: "" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("throws NOT_FOUND when the meeting isn't owned by the caller", async () => {
    mockDb.delete.mockReturnValue(createChain([]));

    const caller = createCaller(authedCtx());
    await expect(caller.remove({ id: "meeting_1" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("removes an owned meeting", async () => {
    const removedRow = { id: "meeting_1", userId: "user_1" };
    mockDb.delete.mockReturnValue(createChain([removedRow]));

    const caller = createCaller(authedCtx());
    const result = await caller.remove({ id: "meeting_1" });

    expect(result).toEqual(removedRow);
  });
});
