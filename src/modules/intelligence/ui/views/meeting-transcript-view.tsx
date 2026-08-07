"use client";

import { useQuery } from "@tanstack/react-query";
import { FileTextIcon } from "lucide-react";

import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";

interface MeetingTranscriptViewProps {
  meetingId: string;
}

const formatTimestamp = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const MeetingTranscriptView = ({ meetingId }: MeetingTranscriptViewProps) => {
  const trpc = useTRPC();
  const { data: transcript, isLoading } = useQuery(
    trpc.intelligence.getTranscript.queryOptions({ meetingId })
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!transcript || transcript.entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <FileTextIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">No transcript yet</p>
          <p className="text-sm text-muted-foreground">
            The transcript will appear here once this meeting ends and Stream finishes
            processing the recording.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transcript.entries.map((entry, index) => (
        <div key={index} className="flex gap-3 text-sm">
          <GeneratedAvatar
            seed={entry.speakerName}
            variant="initials"
            className="size-7 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-medium">{entry.speakerName}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatTimestamp(entry.startTs)}
              </span>
            </div>
            <p className="leading-relaxed text-muted-foreground">{entry.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
