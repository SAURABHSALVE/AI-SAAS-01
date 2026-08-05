import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentSchema, agentUpdateSchema } from "../schemas";

export const agentsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        search: z.string().nullish(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const data = await db
        .select()
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.userId),
            input?.search ? ilike(agents.name, `%${input.search}%`) : undefined
          )
        );

      return data;
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [existingAgent] = await db
        .select({
          ...getTableColumns(agents),
          meetingCount: sql<number>`cast(count(${meetings.id}) as int)`,
        })
        .from(agents)
        .leftJoin(meetings, eq(meetings.agentId, agents.id))
        .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.userId)))
        .groupBy(agents.id);

      if (!existingAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return existingAgent;
    }),
  create: protectedProcedure
    .input(agentSchema)
    .mutation(async ({ ctx, input }) => {
      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          userId: ctx.userId,
        })
        .returning();

      return createdAgent;
    }),
  update: protectedProcedure
    .input(agentUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...values } = input;

      const [updatedAgent] = await db
        .update(agents)
        .set(values)
        .where(and(eq(agents.id, id), eq(agents.userId, ctx.userId)))
        .returning();

      if (!updatedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return updatedAgent;
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [removedAgent] = await db
        .delete(agents)
        .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.userId)))
        .returning();

      if (!removedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return removedAgent;
    }),
});