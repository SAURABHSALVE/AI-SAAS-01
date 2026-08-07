import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type MeetingInsights = RouterOutputs["intelligence"]["getInsights"];
export type MeetingTranscript = RouterOutputs["intelligence"]["getTranscript"];
