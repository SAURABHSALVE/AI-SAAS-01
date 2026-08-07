"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  type Call,
  CallingState,
  StreamCall,
  StreamTheme,
  useCall,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { toast } from "sonner";

import { LoadingState } from "@/components/loading-state";
import { CallActive } from "@/modules/call/ui/components/call-active";
import { CallEnded } from "@/modules/call/ui/components/call-ended";
import { CallLobby } from "@/modules/call/ui/components/call-lobby";
import { useTRPC } from "@/trpc/client";

interface CallViewProps {
  meetingId: string;
  meetingTitle: string;
}

const CallUI = ({ meetingId, meetingTitle }: CallViewProps) => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [hasLeft, setHasLeft] = useState(false);

  const trpc = useTRPC();
  const triggerAgentJoin = useMutation(
    trpc.meetings.triggerAgentJoin.mutationOptions({
      onSuccess: (result) => {
        if (!result.joined && result.reason === "service-unreachable") {
          toast.info("This meeting has an AI agent, but the voice-agent service isn't running.");
        }
      },
    })
  );

  const handleJoin = () => {
    void call?.join({ create: true });
    triggerAgentJoin.mutate({ meetingId });
  };

  const handleLeave = () => {
    call?.endCall();
    setHasLeft(true);
  };

  if (hasLeft || callingState === CallingState.LEFT) {
    return <CallEnded meetingId={meetingId} />;
  }

  if (callingState === CallingState.JOINED) {
    return <CallActive meetingTitle={meetingTitle} onLeave={handleLeave} />;
  }

  return (
    <CallLobby meetingId={meetingId} meetingTitle={meetingTitle} onJoin={handleJoin} />
  );
};

export const CallView = ({ meetingId, meetingTitle }: CallViewProps) => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call>();

  useEffect(() => {
    if (!client) return;

    const nextCall = client.call("default", meetingId);
    setCall(nextCall);

    return () => {
      if (nextCall.state.callingState !== CallingState.LEFT) {
        void nextCall.leave();
      }
      setCall(undefined);
    };
  }, [client, meetingId]);

  if (!call) {
    return (
      <LoadingState title="Starting call..." description="Please wait" />
    );
  }

  return (
    <StreamTheme className="h-full">
      <StreamCall call={call}>
        <CallUI meetingId={meetingId} meetingTitle={meetingTitle} />
      </StreamCall>
    </StreamTheme>
  );
};
