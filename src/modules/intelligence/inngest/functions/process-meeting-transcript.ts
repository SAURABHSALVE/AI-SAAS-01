import "server-only";
import { eq } from "drizzle-orm";
import { NonRetriableError } from "inngest";

import { db } from "@/db";
import {
  meetingInsights,
  meetings,
  meetingTranscriptChunks,
  meetingTranscripts,
} from "@/db/schema";
import { chunkTranscript } from "../../lib/chunk-transcript";
import { embedTexts } from "../../lib/embed-text";
import { generateMeetingInsights } from "../../lib/generate-insights";
import { inngest, type MeetingTranscriptReadyEventData } from "../client";

export const processMeetingTranscript = inngest.createFunction(
  {
    id: "process-meeting-transcript",
    retries: 3,
    triggers: [{ event: "meeting/transcript.ready" }],
    onFailure: async ({ event, error }) => {
      const { meetingId } = event.data.event.data as MeetingTranscriptReadyEventData;

      await db
        .update(meetings)
        .set({ processingStatus: "failed", processingError: error.message })
        .where(eq(meetings.id, meetingId));
    },
  },
  async ({ event, step }) => {
    const { meetingId } = event.data as MeetingTranscriptReadyEventData;

    await step.run("mark-processing", async () => {
      await db
        .update(meetings)
        .set({ processingStatus: "processing", processingError: null })
        .where(eq(meetings.id, meetingId));
    });

    const { meetingTitle, entries } = await step.run("load-transcript", async () => {
      const [meeting] = await db
        .select({ id: meetings.id, title: meetings.title })
        .from(meetings)
        .where(eq(meetings.id, meetingId));

      if (!meeting) {
        throw new NonRetriableError(`Meeting ${meetingId} not found`);
      }

      const [transcript] = await db
        .select({ entries: meetingTranscripts.entries })
        .from(meetingTranscripts)
        .where(eq(meetingTranscripts.meetingId, meetingId));

      if (!transcript || transcript.entries.length === 0) {
        throw new NonRetriableError(`No transcript stored for meeting ${meetingId}`);
      }

      return { meetingTitle: meeting.title, entries: transcript.entries };
    });

    const insights = await step.run("generate-insights", () =>
      generateMeetingInsights(meetingTitle, entries)
    );

    await step.run("save-insights", async () => {
      await db
        .insert(meetingInsights)
        .values({ meetingId, ...insights })
        .onConflictDoUpdate({
          target: meetingInsights.meetingId,
          set: { ...insights, updatedAt: new Date() },
        });
    });

    await step.run("chunk-and-embed", async () => {
      const chunks = chunkTranscript(entries);
      if (chunks.length === 0) return;

      const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));

      await db
        .delete(meetingTranscriptChunks)
        .where(eq(meetingTranscriptChunks.meetingId, meetingId));

      await db.insert(meetingTranscriptChunks).values(
        chunks.map((chunk, i) => ({
          meetingId,
          chunkIndex: chunk.index,
          content: chunk.content,
          speakerName: chunk.speakerName,
          startTs: chunk.startTs,
          stopTs: chunk.stopTs,
          embedding: embeddings[i],
        }))
      );
    });

    await step.run("mark-complete", async () => {
      await db
        .update(meetings)
        .set({ processingStatus: "completed", processingError: null })
        .where(eq(meetings.id, meetingId));
    });

    return { meetingId, status: "completed" as const };
  }
);
