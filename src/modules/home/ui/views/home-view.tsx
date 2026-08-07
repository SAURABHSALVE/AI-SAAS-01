"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  BotIcon,
  CalendarCheckIcon,
  RadioIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { getMeetingStatus } from "@/modules/meetings/lib/get-meeting-status";
import { MeetingCard } from "@/modules/meetings/ui/components/meeting-card";
import { MeetingsEmptyState } from "@/modules/meetings/ui/components/meetings-empty-state";
import { CreateMeetingDialog } from "@/modules/meetings/ui/views/meetings-view";
import { AgentCard } from "@/modules/agents/ui/components/agent-card";
import { AgentsEmptyState } from "@/modules/agents/ui/components/agents-empty-state";
import { CreateAgentDialog } from "@/modules/agents/ui/views/agents-view";
import { HomeStatCard } from "@/modules/home/ui/components/home-stat-card";
import { HomeEmptyState } from "@/modules/home/ui/components/home-empty-state";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { Button } from "@/components/ui/button";

interface HomeViewProps {
  userName: string;
}

const RECENT_MEETINGS_LIMIT = 3;
const AGENT_ROSTER_LIMIT = 3;

export const HomeView = ({ userName }: HomeViewProps) => {
  const trpc = useTRPC();
  const router = useRouter();

  const { data: meetings } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({ filter: "all", durationFilter: "any" })
  );
  const { data: agents } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({ scope: "mine" })
  );

  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);

  const firstName = userName.split(" ")[0];

  const withStatus = meetings.map((meeting) => ({
    meeting,
    status: getMeetingStatus(new Date(meeting.startsAt), meeting.durationMinutes),
  }));

  const upcomingCount = withStatus.filter((m) => m.status === "upcoming").length;
  const liveCount = withStatus.filter((m) => m.status === "active").length;
  const completedCount = withStatus.filter((m) => m.status === "completed").length;

  const upcoming = withStatus
    .filter((m) => m.status === "upcoming" || m.status === "active")
    .sort((a, b) => new Date(a.meeting.startsAt).getTime() - new Date(b.meeting.startsAt).getTime());
  const recentPast = withStatus
    .filter((m) => m.status === "completed")
    .sort((a, b) => new Date(b.meeting.startsAt).getTime() - new Date(a.meeting.startsAt).getTime());

  const previewMeetings = (upcoming.length > 0 ? upcoming : recentPast)
    .slice(0, RECENT_MEETINGS_LIMIT)
    .map((m) => m.meeting);
  const meetingsSectionTitle = upcoming.length > 0 ? "Upcoming meetings" : "Recent meetings";

  const previewAgents = agents.slice(0, AGENT_ROSTER_LIMIT);

  const hasNoDataAtAll = meetings.length === 0 && agents.length === 0;

  if (hasNoDataAtAll) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <div className="flex flex-col gap-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Welcome, {firstName}</h1>
            <p className="text-sm text-muted-foreground">
              Let&apos;s get your first meeting or agent set up.
            </p>
          </div>

          <HomeEmptyState
            onCreateMeeting={() => setCreateMeetingOpen(true)}
            onCreateAgent={() => setCreateAgentOpen(true)}
          />
        </div>

        <CreateMeetingDialog open={createMeetingOpen} onOpenChange={setCreateMeetingOpen} />
        <CreateAgentDialog open={createAgentOpen} onOpenChange={setCreateAgentOpen} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GeneratedAvatar seed={userName} variant="initials" className="size-11" />
            <div>
              <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
              <p className="text-sm text-muted-foreground">
                Here&apos;s what&apos;s happening across your meetings and agents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCreateAgentOpen(true)}>
              <BotIcon className="size-4" />
              New agent
            </Button>
            <Button onClick={() => setCreateMeetingOpen(true)}>
              <VideoIcon className="size-4" />
              New meeting
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <HomeStatCard label="Live now" value={liveCount} icon={RadioIcon} live />
          <HomeStatCard label="Upcoming" value={upcomingCount} icon={CalendarCheckIcon} />
          <HomeStatCard label="Completed" value={completedCount} icon={VideoIcon} />
          <HomeStatCard label="Agents" value={agents.length} icon={UsersIcon} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{meetingsSectionTitle}</h2>
            <Link
              href="/meetings"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>

          {meetings.length === 0 ? (
            <MeetingsEmptyState
              variant="no-meetings"
              action={
                <Button onClick={() => setCreateMeetingOpen(true)}>
                  <VideoIcon className="size-4" />
                  New meeting
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={() => router.push(`/meetings/${meeting.id}`)}
                  onDelete={() => router.push(`/meetings/${meeting.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your agents</h2>
            <Link
              href="/agents"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>

          {agents.length === 0 ? (
            <AgentsEmptyState
              variant="no-agents"
              action={
                <Button onClick={() => setCreateAgentOpen(true)}>
                  <BotIcon className="size-4" />
                  New agent
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onEdit={() => router.push(`/agents/${agent.id}`)}
                  onDelete={() => router.push(`/agents/${agent.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateMeetingDialog open={createMeetingOpen} onOpenChange={setCreateMeetingOpen} />
      <CreateAgentDialog open={createAgentOpen} onOpenChange={setCreateAgentOpen} />
    </div>
  );
};
