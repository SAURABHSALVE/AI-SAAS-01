import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { meetingChatMessages, meetings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { GEMINI_CHAT_MODEL } from "@/lib/gemini";
import { searchTranscript } from "@/modules/intelligence/lib/search-transcript";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const extractText = (message: UIMessage) =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .trim();

interface Params {
  params: Promise<{ meetingId: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { meetingId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [meeting] = await db
    .select({ id: meetings.id, title: meetings.title })
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.userId, session.user.id)));

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const { messages }: { messages: UIMessage[] } = await request.json();
  const lastMessage = messages[messages.length - 1];
  const question = lastMessage ? extractText(lastMessage) : "";

  if (!question) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const MAX_MESSAGE_LENGTH = 2000;
  if (question.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)` },
      { status: 400 }
    );
  }

  let chunks: Awaited<ReturnType<typeof searchTranscript>>;
  try {
    chunks = await searchTranscript(meetingId, question);
  } catch (error) {
    console.error("Failed to search transcript:", error);
    return NextResponse.json(
      { error: "Failed to search the meeting transcript. Please try again." },
      { status: 500 }
    );
  }

  const [userMessage] = await db
    .insert(meetingChatMessages)
    .values({
      meetingId,
      role: "user",
      content: question,
    })
    .returning({ id: meetingChatMessages.id });

  const context = chunks.length
    ? chunks
        .map((chunk, i) => `[${i + 1}] ${chunk.speakerName ?? "Unknown"}: ${chunk.content}`)
        .join("\n\n")
    : "(no relevant transcript excerpts were found for this question)";

  const systemPrompt = [
    `You are answering questions about the meeting "${meeting.title}" using only the`,
    "transcript excerpts below. Cite sources inline using [1], [2], etc. matching the",
    "excerpt numbers. If the transcript doesn't contain the answer, say so plainly —",
    "never invent information that wasn't in the transcript.",
    "",
    "Transcript excerpts:",
    context,
  ].join("\n");

  try {
    const result = streamText({
      model: google(GEMINI_CHAT_MODEL),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        await db.insert(meetingChatMessages).values({
          meetingId,
          role: "assistant",
          content: text,
          citations: chunks.map((chunk) => ({
            chunkId: chunk.id,
            speakerName: chunk.speakerName,
            quote: chunk.content,
          })),
        });
      },
      onError: async ({ error }) => {
        console.error("streamText error:", error);
        if (userMessage) {
          await db.delete(meetingChatMessages).where(eq(meetingChatMessages.id, userMessage.id));
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Failed to generate chat response:", error);
    if (userMessage) {
      await db.delete(meetingChatMessages).where(eq(meetingChatMessages.id, userMessage.id));
    }
    return NextResponse.json(
      { error: "Failed to generate a response. Please try again." },
      { status: 500 }
    );
  }
}
