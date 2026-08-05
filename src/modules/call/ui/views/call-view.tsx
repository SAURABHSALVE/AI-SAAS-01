"use client";

import { useEffect, useState } from "react";
import {
  type Call,
  CallingState,
  StreamCall,
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
    void call?.join();
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
    nextCall.camera.disable();
    nextCall.microphone.disable();
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
    <StreamCall call={call}>
      <CallUI meetingId={meetingId} meetingTitle={meetingTitle} />
    </StreamCall>
  );
};
