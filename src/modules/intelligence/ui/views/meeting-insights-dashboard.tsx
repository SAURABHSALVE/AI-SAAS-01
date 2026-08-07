"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useMeetingProcessingStatus } from "@/modules/intelligence/ui/hooks/use-meeting-processing-status";
import { ActionItemsCard } from "@/modules/intelligence/ui/components/action-items-card";
import { AiSummaryCard } from "@/modules/intelligence/ui/components/ai-summary-card";
import { DecisionTimeline } from "@/modules/intelligence/ui/components/decision-timeline";
import { FollowUpEmailCard } from "@/modules/intelligence/ui/components/follow-up-email-card";
import { ImportantQuotesCard } from "@/modules/intelligence/ui/components/important-quotes-card";
import { InsightsDashboardSkeleton } from "@/modules/intelligence/ui/components/insights-dashboard-skeleton";
import { NextAgendaCard } from "@/modules/intelligence/ui/components/next-agenda-card";
import { ProcessingBanner } from "@/modules/intelligence/ui/components/processing-banner";
import { RisksDeadlinesCard } from "@/modules/intelligence/ui/components/risks-deadlines-card";
import { SpeakerStatistics } from "@/modules/intelligence/ui/components/speaker-statistics";

interface MeetingInsightsDashboardProps {
  meetingId: string;
}

export const MeetingInsightsDashboard = ({ meetingId }: MeetingInsightsDashboardProps) => {
  const trpc = useTRPC();
  const { data: meeting } = useMeetingProcessingStatus(meetingId);

  const { data: insights } = useQuery({
    ...trpc.intelligence.getInsights.queryOptions({ meetingId }),
    refetchInterval: meeting?.processingStatus === "processing" ? 4000 : false,
  });

  if (!meeting) {
    return <InsightsDashboardSkeleton />;
  }

  return (
    <div className="space-y-4">
      {meeting.processingStatus !== "completed" && (
        <ProcessingBanner status={meeting.processingStatus} error={meeting.processingError} />
      )}

      {insights && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <AiSummaryCard insights={insights} />
          </div>

          <ActionItemsCard
            actionItems={insights.actionItems}
            followUpTasks={insights.followUpTasks}
          />
          <DecisionTimeline decisions={insights.keyDecisions} />
          <RisksDeadlinesCard risks={insights.risks} deadlines={insights.deadlines} />
          <SpeakerStatistics speakers={insights.speakerInsights} />
          <ImportantQuotesCard quotes={insights.importantQuotes} />
          <NextAgendaCard agenda={insights.suggestedNextAgenda} />

          <div className="lg:col-span-2">
            <FollowUpEmailCard email={insights.followUpEmail} />
          </div>
        </div>
      )}
    </div>
  );
};
