import { AlertTriangleIcon, ClockIcon, SparklesIcon } from "lucide-react";

import type { meetingProcessingStatus } from "@/db/schema";

type ProcessingStatus = (typeof meetingProcessingStatus.enumValues)[number];

interface ProcessingBannerProps {
  status: ProcessingStatus;
  error?: string | null;
}

export const ProcessingBanner = ({ status, error }: ProcessingBannerProps) => {
  if (status === "idle") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <ClockIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Insights not generated yet</p>
          <p className="text-sm text-muted-foreground">
            AI insights are generated automatically once this meeting ends and its
            transcript is ready.
          </p>
        </div>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
        <SparklesIcon className="size-4 shrink-0 animate-pulse text-primary" />
        <div>
          <p className="font-medium">Generating AI insights...</p>
          <p className="text-muted-foreground">
            This usually takes under a minute. The page will update automatically.
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <AlertTriangleIcon className="size-4 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Insight generation failed</p>
          <p className="text-muted-foreground">
            {error || "Something went wrong while processing this meeting."}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
