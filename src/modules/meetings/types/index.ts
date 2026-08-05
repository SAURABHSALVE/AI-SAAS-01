import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type MeetingGetMany = RouterOutputs["meetings"]["getMany"][number];
export type MeetingGetOne = RouterOutputs["meetings"]["getOne"];
