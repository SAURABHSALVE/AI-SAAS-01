"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";

import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";

interface StreamVideoProviderProps {
  userId: string;
  userName: string;
  userImage?: string | null;
  meetingId: string;
  children: React.ReactNode;
}

export const StreamVideoProvider = ({
  userId,
  userName,
  userImage,
  meetingId,
  children,
}: StreamVideoProviderProps) => {
  const trpc = useTRPC();
  const generateToken = useMutation(trpc.meetings.generateToken.mutationOptions());
  const [client, setClient] = useState<StreamVideoClient>();

  useEffect(() => {
    const videoClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
      user: {
        id: userId,
        name: userName,
        image: userImage ?? undefined,
      },
      tokenProvider: () => generateToken.mutateAsync({ meetingId }),
    });

    setClient(videoClient);

    return () => {
      setClient(undefined);
      void videoClient.disconnectUser();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userName, userImage, meetingId]);

  if (!client) {
    return (
      <LoadingState
        title="Connecting..."
        description="Setting up your call"
      />
    );
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
};
