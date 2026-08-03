import { eq } from "drizzle-orm";

import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentSchema } from "../schemas";

export const agentsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const data = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.userId));

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