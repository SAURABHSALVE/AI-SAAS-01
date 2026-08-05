import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type AgentGetMany = RouterOutputs["agents"]["getMany"][number];
export type AgentGetOne = RouterOutputs["agents"]["getOne"];
