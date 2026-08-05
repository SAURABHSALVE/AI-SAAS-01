"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  BotIcon,
  CalendarIcon,
  ClockIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
  VideoIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getMeetingStatus } from "@/modules/meetings/lib/get-meeting-status";
import { MeetingStatusBadge } from "@/modules/meetings/ui/components/meeting-status-badge";
import type { MeetingGetMany } from "@/modules/meetings/types";

interface MeetingCardProps {
  meeting: MeetingGetMany;
  onEdit: () => void;
  onDelete: () => void;
}

export const MeetingCard = ({ meeting, onEdit, onDelete }: MeetingCardProps) => {
  const startsAt = new Date(meeting.startsAt);
  const status = getMeetingStatus(startsAt, meeting.durationMinutes);

  return (
    <Card className="transition-colors hover:border-primary/50 hover:shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Link
            href={`/meetings/${meeting.id}`}
            className="line-clamp-1 font-medium underline-offset-4 hover:underline"
          >
            {meeting.title}
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <GeneratedAvatar
              seed={meeting.host.name}
              variant="initials"
              className="size-4"
            />
            <span className="truncate">{meeting.host.name}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label="Meeting actions"
            >
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <PencilIcon className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <TrashIcon className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            {format(startsAt, "MMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon className="size-3.5" />
            {format(startsAt, "h:mm a")} &middot; {meeting.durationMinutes}m
          </span>
        </div>

        {meeting.agent && (
          <Badge variant="secondary" className="w-fit gap-1.5 font-normal">
            <BotIcon className="size-3.5" />
            {meeting.agent.name}
          </Badge>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {meeting.participants.slice(0, 4).map((participant) => (
                <Tooltip key={participant}>
                  <TooltipTrigger asChild>
                    <GeneratedAvatar
                      seed={participant}
                      variant="initials"
                      className="size-6 border-2 border-background"
                    />
                  </TooltipTrigger>
                  <TooltipContent>{participant}</TooltipContent>
                </Tooltip>
              ))}
            </div>
            {meeting.participants.length > 4 && (
              <span className="ml-2 text-xs text-muted-foreground">
                +{meeting.participants.length - 4}
              </span>
            )}
          </div>

          <MeetingStatusBadge status={status} />
        </div>

        {status === "active" ? (
          <Button size="sm" className="w-full" asChild>
            <Link href={`/call/${meeting.id}`}>
              <VideoIcon className="size-4" />
              Join meeting
            </Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled className="w-full">
            <VideoIcon className="size-4" />
            {status === "completed" ? "Meeting ended" : "Join meeting"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
