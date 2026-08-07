import { SparklesIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingTags } from "@/modules/intelligence/ui/components/meeting-tags";
import { SentimentBadge } from "@/modules/intelligence/ui/components/sentiment-badge";
import type { MeetingInsights } from "@/modules/intelligence/types";

interface AiSummaryCardProps {
  insights: NonNullable<MeetingInsights>;
}

export const AiSummaryCard = ({ insights }: AiSummaryCardProps) => {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <SparklesIcon className="size-4 text-primary" />
          Executive summary
        </CardTitle>
        <SentimentBadge sentiment={insights.sentiment} score={insights.sentimentScore} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {insights.executiveSummary}
        </p>
        <MeetingTags tags={insights.tags} topics={insights.topics} />
      </CardContent>
    </Card>
  );
};
