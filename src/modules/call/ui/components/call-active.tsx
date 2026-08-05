"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CallControls, SpeakerLayout, useCallStateHooks } from "@stream-io/video-react-sdk";
import { UsersIcon, VideoIcon } from "lucide-react";

interface CallActiveProps {
  meetingTitle: string;
  onLeave: () => void;
}

const formatElapsed = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};

export const CallActive = ({ meetingTitle, onLeave }: CallActiveProps) => {
  const { useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#101213] text-white">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/meetings"
          className="flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
        >
          <VideoIcon className="size-4" />
          <span className="max-w-[240px] truncate">{meetingTitle}</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-white/60">
          <span className="tabular-nums">{formatElapsed(elapsed)}</span>
          <span className="flex items-center gap-1.5">
            <UsersIcon className="size-3.5" />
            {participantCount}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <SpeakerLayout />
      </div>

      <div className="flex items-center justify-center p-4">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};
