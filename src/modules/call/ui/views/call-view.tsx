"use client";

import { useEffect, useState } from "react";
import {
  type Call,
  CallingState,
  StreamCall,
  StreamTheme,
  useCall,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";

import { LoadingState } from "@/components/loading-state";
import { CallActive } from "@/modules/call/ui/components/call-active";
import { CallEnded } from "@/modules/call/ui/components/call-ended";
import { CallLobby } from "@/modules/call/ui/components/call-lobby";

interface CallViewProps {
  meetingId: string;
  meetingTitle: string;
}

const CallUI = ({ meetingId, meetingTitle }: CallViewProps) => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [hasLeft, setHasLeft] = useState(false);

  const handleJoin = () => {
    void call?.join({ create: true });
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
