"use client";

import Link from "next/link";
import {
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CallLobbyProps {
  meetingId: string;
  meetingTitle: string;
  onJoin: () => void;
}

export const CallLobby = ({ meetingId, meetingTitle, onJoin }: CallLobbyProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-[#101213] p-4 text-white">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold">Ready to join?</h1>
        <p className="text-sm text-white/60">{meetingTitle}</p>
      </div>

      <div className="aspect-video w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black [&_video]:h-full [&_video]:w-full [&_video]:object-cover">
        <VideoPreview />
      </div>

      <div className="flex items-center gap-3">
        <ToggleAudioPreviewButton />
        <ToggleVideoPreviewButton />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" asChild>
          <Link href={`/meetings/${meetingId}`}>Cancel</Link>
        </Button>
        <Button onClick={onJoin}>
          <LogInIcon className="size-4" />
          Join meeting
        </Button>
      </div>
    </div>
  );
};
