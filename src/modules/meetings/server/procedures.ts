import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt, gte, ilike, lt, lte, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { meetingSchema, meetingUpdateSchema } from "../schemas";
import { combineDateAndTime } from "../lib/meeting-datetime";

/** SQL for the meeting's end timestamp, used to split upcoming/past without a stored status. */
const endsAtExpr = sql`${meetings.startsAt} + (${meetings.durationMinutes} || ' minutes')::interval`;

const meetingSelection = {
  id: meetings.id,
  title: meetings.title,
  description: meetings.description,
  startsAt: meetings.startsAt,
  durationMinutes: meetings.durationMinutes,
  participants: meetings.participants,
  userId: meetings.userId,
  processingStatus: meetings.processingStatus,
  processingError: meetings.processingError,
  createdAt: meetings.createdAt,
  updatedAt: meetings.updatedAt,
  host: {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  },
  agent: {
    id: agents.id,
    name: agents.name,
  },
};

export const meetingsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z
        .object({
          search: z.string().nullish(),
          filter: z.enum(["all", "upcoming", "past"]).default("all"),
          durationFilter: z
            .enum(["any", "short", "medium", "long"])
            .default("any"),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const filter = input?.filter ?? "all";
      const durationFilter = input?.durationFilter ?? "any";

      const rows = await db
        .select(meetingSelection)
        .from(meetings)
        .innerJoin(user, eq(meetings.userId, user.id))
        .leftJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.userId, ctx.userId),
            input?.search ? ilike(meetings.title, `%${input.search}%`) : undefined,
            filter === "upcoming" ? gte(endsAtExpr, sql`now()`) : undefined,
            filter === "past" ? lt(endsAtExpr, sql`now()`) : undefined,
            durationFilter === "short" ? lt(meetings.durationMinutes, 30) : undefined,
            durationFilter === "medium"
              ? and(gte(meetings.durationMinutes, 30), lte(meetings.durationMinutes, 60))
              : undefined,
            durationFilter === "long" ? gt(meetings.durationMinutes, 60) : undefined
          )
        )
        .orderBy(
          filter === "past" ? desc(meetings.startsAt) : meetings.startsAt
        );

      return rows;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select(meetingSelection)
        .from(meetings)
        .innerJoin(user, eq(meetings.userId, user.id))
        .leftJoin(agents, eq(meetings.agentId, agents.id))
        .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.userId)));

      if (!existingMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return existingMeeting;
    }),

  getRecordings: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select({ id: meetings.id })
        .from(meetings)
        .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.userId)));

      if (!existingMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      const { recordings } = await streamVideo.video
        .call("default", input.id)
        .listRecordings();

      return recordings;
    }),

  generateToken: protectedProcedure
    .input(z.object({ meetingId: z.string().min(1) }).optional())
    .mutation(async ({ ctx, input }) => {
      await streamVideo.upsertUsers([
        {
          id: ctx.userId,
          name: ctx.session.user.name,
          image: ctx.session.user.image ?? undefined,
          role: "admin",
        },
      ]);

      if (input?.meetingId) {
        const [ownedMeeting] = await db
          .select({ id: meetings.id })
          .from(meetings)
          .where(and(eq(meetings.id, input.meetingId), eq(meetings.userId, ctx.userId)));

        if (!ownedMeeting) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
        }

        // Server-authoritative: ensures the call exists, then always (re-)applies the
        // transcription setting. `getOrCreate`'s settings_override only takes effect the
        // moment the call is first created — on every later join it would be a no-op — so
        // `update` runs unconditionally to guarantee transcription is actually on.
        const streamCall = streamVideo.video.call("default", input.meetingId);
        await streamCall.getOrCreate({ data: { created_by_id: ctx.userId } });
        await streamCall.update({
          settings_override: {
            transcription: { mode: "auto-on", language: "auto" },
          },
        });
      }

      const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
      const issuedAt = Math.floor(Date.now() / 1000) - 60;

      return streamVideo.generateUserToken({
        user_id: ctx.userId,
        exp: expirationTime,
        iat: issuedAt,
      });
    }),

  create: protectedProcedure
    .input(meetingSchema)
    .mutation(async ({ ctx, input }) => {
      const { date, time, duration, agentId, ...values } = input;

      if (agentId) {
        const [accessibleAgent] = await db
          .select({ id: agents.id })
          .from(agents)
          .where(
            and(
              eq(agents.id, agentId),
              or(eq(agents.ownerId, ctx.userId), eq(agents.visibility, "public"))
            )
          );

        if (!accessibleAgent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
      }

      const [createdMeeting] = await db
        .insert(meetings)
        .values({
          ...values,
          durationMinutes: duration,
          startsAt: combineDateAndTime(date, time),
          userId: ctx.userId,
          agentId: agentId ?? null,
        })
        .returning();

      return createdMeeting;
    }),

  update: protectedProcedure
    .input(meetingUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, date, time, duration, agentId, ...values } = input;

      if (agentId) {
        const [accessibleAgent] = await db
          .select({ id: agents.id })
          .from(agents)
          .where(
            and(
              eq(agents.id, agentId),
              or(eq(agents.ownerId, ctx.userId), eq(agents.visibility, "public"))
            )
          );

        if (!accessibleAgent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
      }

      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          ...values,
          durationMinutes: duration,
          startsAt: combineDateAndTime(date, time),
          agentId: agentId ?? null,
        })
        .where(and(eq(meetings.id, id), eq(meetings.userId, ctx.userId)))
        .returning();

      if (!updatedMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return updatedMeeting;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [removedMeeting] = await db
        .delete(meetings)
        .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.userId)))
        .returning();

      if (!removedMeeting) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
      }

      return removedMeeting;
    }),
});
