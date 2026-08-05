"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlayCircleIcon, VideoOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";

interface MeetingRecordingsProps {
  meetingId: string;
}

export const MeetingRecordings = ({ meetingId }: MeetingRecordingsProps) => {
  const trpc = useTRPC();
  const { data: recordings, isLoading } = useQuery(
    trpc.meetings.getRecordings.queryOptions({ id: meetingId })
  );

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">Recordings</h2>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      ) : !recordings || recordings.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <VideoOffIcon className="size-4" />
          No recordings yet.
        </div>
      ) : (
        <div className="space-y-2">
          {recordings.map((recording) => {
            const start = new Date(recording.start_time);
            const end = new Date(recording.end_time);
            const durationMinutes = Math.max(
              1,
              Math.round((end.getTime() - start.getTime()) / 60_000)
            );

            return (
              <div
                key={recording.url}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {format(start, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {durationMinutes} min recording
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={recording.url} target="_blank" rel="noopener noreferrer">
                    <PlayCircleIcon className="size-4" />
                    Watch
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
