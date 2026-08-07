import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentSchema, agentUpdateSchema } from "../schemas";

const ownerSelection = {
  id: user.id,
  name: user.name,
  image: user.image,
};

export const agentsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z
        .object({
          search: z.string().nullish(),
          category: z.string().nullish(),
          scope: z.enum(["mine", "public", "all"]).default("mine"),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const scope = input?.scope ?? "mine";

      const data = await db
        .select({
          ...getTableColumns(agents),
          owner: ownerSelection,
        })
        .from(agents)
        .innerJoin(user, eq(agents.ownerId, user.id))
        .where(
          and(
            scope === "mine" ? eq(agents.ownerId, ctx.userId) : undefined,
            scope === "public" ? eq(agents.visibility, "public") : undefined,
            scope === "all"
              ? or(eq(agents.ownerId, ctx.userId), eq(agents.visibility, "public"))
              : undefined,
            input?.search ? ilike(agents.name, `%${input.search}%`) : undefined,
            input?.category ? eq(agents.category, input.category) : undefined
          )
        );

      return data.map((agent) => ({
        ...agent,
        isOwner: agent.ownerId === ctx.userId,
      }));
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [existingAgent] = await db
        .select({
          ...getTableColumns(agents),
          owner: ownerSelection,
          meetingCount: sql<number>`cast(count(${meetings.id}) as int)`,
        })
        .from(agents)
        .innerJoin(user, eq(agents.ownerId, user.id))
        .leftJoin(meetings, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(agents.id, input.id),
            or(eq(agents.ownerId, ctx.userId), eq(agents.visibility, "public"))
          )
        )
        .groupBy(agents.id, user.id);

      if (!existingAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return { ...existingAgent, isOwner: existingAgent.ownerId === ctx.userId };
    }),

  create: protectedProcedure
    .input(agentSchema)
    .mutation(async ({ ctx, input }) => {
      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          ownerId: ctx.userId,
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
        .where(and(eq(agents.id, id), eq(agents.ownerId, ctx.userId)))
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
        .where(and(eq(agents.id, input.id), eq(agents.ownerId, ctx.userId)))
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
