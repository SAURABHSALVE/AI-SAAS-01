import { UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { Progress } from "@/components/ui/progress";
import { SentimentBadge } from "@/modules/intelligence/ui/components/sentiment-badge";
import type { SpeakerInsight } from "@/db/schema";

interface SpeakerStatisticsProps {
  speakers: SpeakerInsight[];
}

const formatTalkTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

export const SpeakerStatistics = ({ speakers }: SpeakerStatisticsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UsersIcon className="size-4 text-primary" />
          Speaker statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {speakers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No speaker data available.</p>
        ) : (
          <div className="space-y-5">
            {speakers.map((speaker) => (
              <div key={speaker.speakerName} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <GeneratedAvatar
                      seed={speaker.speakerName}
                      variant="initials"
                      className="size-6 shrink-0"
                    />
                    <span className="truncate text-sm font-medium">{speaker.speakerName}</span>
                    <SentimentBadge sentiment={speaker.sentiment} />
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatTalkTime(speaker.talkTimeSeconds)} &middot;{" "}
                    {speaker.talkTimePercent.toFixed(0)}%
                  </span>
                </div>
                <Progress value={speaker.talkTimePercent} className="h-1.5" />
                {speaker.keyContributions.length > 0 && (
                  <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {speaker.keyContributions.map((contribution, index) => (
                      <li key={index}>{contribution}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
