import { createTRPCRouter } from '../init';
import { agentsRouter } from '@/modules/agents/server/procedures';
import { meetingsRouter } from '@/modules/meetings/server/procedures';
import { intelligenceRouter } from '@/modules/intelligence/server/procedures';

export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,
  intelligence: intelligenceRouter,
});

export type AppRouter = typeof appRouter;