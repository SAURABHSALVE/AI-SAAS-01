import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';

import { auth } from '@/lib/auth';

export const createTRPCContext = cache(async (opts?: { req?: Request }) => {
  const session = await auth.api.getSession({
    headers: opts?.req?.headers ?? (await headers()),
  });

  return {
    session,
    userId: session?.user?.id ?? null,
  };
});

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure;


export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});