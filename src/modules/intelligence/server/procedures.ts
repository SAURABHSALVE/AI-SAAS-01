import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { meetingInsights, meetings, meetingTranscripts } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const meetingIdInput = z.object({ meetingId: z.string().min(1) });

const assertOwnsMeeting = async (meetingId: string, userId: string) => {
  const [meeting] = await db
    .select({ id: meetings.id })
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.userId, userId)));

  if (!meeting) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
  }
};

export const intelligenceRouter = createTRPCRouter({
  getInsights: protectedProcedure
    .input(meetingIdInput)
    .query(async ({ ctx, input }) => {
      await assertOwnsMeeting(input.meetingId, ctx.userId);

      const [insights] = await db
        .select()
        .from(meetingInsights)
        .where(eq(meetingInsights.meetingId, input.meetingId));

      return insights ?? null;
    }),

  getTranscript: protectedProcedure
    .input(meetingIdInput)
    .query(async ({ ctx, input }) => {
      await assertOwnsMeeting(input.meetingId, ctx.userId);

      const [transcript] = await db
        .select()
        .from(meetingTranscripts)
        .where(eq(meetingTranscripts.meetingId, input.meetingId));

      return transcript ?? null;
    }),
});
