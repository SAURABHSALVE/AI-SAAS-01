import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentSchema } from "../schemas";

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
});