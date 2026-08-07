"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { StreamVideoProvider } from "@/modules/call/ui/providers/stream-video-provider";
import { CallView } from "@/modules/call/ui/views/call-view";

interface CallPageViewProps {
  meetingId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
}

export const CallPageViewLoading = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-[#101213]">
      <LoadingState title="Loading meeting..." description="Please wait" />
    </div>
  );
};

export const CallPageViewError = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-[#101213]">
      <ErrorState
        title="Failed to load meeting"
        description="Something went wrong. Please try again."
      />
    </div>
  );
};

export const CallPageView = ({
  meetingId,
  userId,
  userName,
  userImage,
}: CallPageViewProps) => {
  const trpc = useTRPC();
  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  return (
    <StreamVideoProvider
      userId={userId}
      userName={userName}
      userImage={userImage}
      meetingId={meetingId}
    >
      <CallView meetingId={meetingId} meetingTitle={meeting.title} />
    </StreamVideoProvider>
  );
};
