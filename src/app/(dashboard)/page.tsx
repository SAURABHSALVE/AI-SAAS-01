import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { HomeView } from "@/modules/home/ui/views/home-view";

// http://localhost:3000

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(
      trpc.meetings.getMany.queryOptions({
        search: undefined,
        filter: "all",
        durationFilter: "any",
      })
    ),
    queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({ scope: "mine" })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <LoadingState
            title="Loading your dashboard..."
            description="Please wait while we fetch your meetings and agents."
          />
        }
      >
        <ErrorBoundary
          fallback={
            <ErrorState
              title="Failed to load dashboard"
              description="Something went wrong while fetching your data. Please try again."
            />
          }
        >
          <HomeView userName={session.user.name} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
