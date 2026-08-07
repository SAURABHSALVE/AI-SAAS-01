"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

/** Polls the meeting while insights are still being generated, stops once settled. */
export const useMeetingProcessingStatus = (meetingId: string) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.meetings.getOne.queryOptions({ id: meetingId }),
    refetchInterval: (query) => {
      const status = query.state.data?.processingStatus;
      return status === "processing" || status === "idle" ? 4000 : false;
    },
  });
};
