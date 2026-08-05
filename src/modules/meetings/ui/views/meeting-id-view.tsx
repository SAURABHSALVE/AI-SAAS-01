"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format } from "date-fns";
import {
  BotIcon,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { useTRPC } from "@/trpc/client";
import { getMeetingStatus } from "@/modules/meetings/lib/get-meeting-status";
import { splitDateAndTime } from "@/modules/meetings/lib/meeting-datetime";
import { meetingSchema } from "@/modules/meetings/schemas";
import { DeleteMeetingDialog } from "@/modules/meetings/ui/components/delete-meeting-dialog";
import { MeetingForm } from "@/modules/meetings/ui/components/meeting-form";
import { MeetingStatusBadge } from "@/modules/meetings/ui/components/meeting-status-badge";

interface Props {
  meetingId: string;
}

export const MeetingIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading meeting..."
      description="Please wait while we fetch the meeting details."
    />
  );
};

export const MeetingIdViewError = () => {
  return (
    <ErrorState
      title="Failed to load meeting"
      description="Something went wrong while fetching this meeting. Please try again."
    />
  );
};

export const MeetingIdView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.meetings.getMany.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.meetings.getOne.queryKey({ id: meetingId }),
          }),
        ]);
        toast.success("Meeting updated");
        setEditOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update meeting");
      },
    })
  );

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.meetings.getMany.queryKey(),
        });
        toast.success("Meeting deleted");
        router.push("/meetings");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete meeting");
        setDeleteOpen(false);
      },
    })
  );

  const startsAt = new Date(meeting.startsAt);
  const status = getMeetingStatus(startsAt, meeting.durationMinutes);

  const onUpdate = (values: z.infer<typeof meetingSchema>) => {
    updateMeeting.mutate({ id: meetingId, ...values });
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-1 text-sm text-muted-foreground">
          <Link
            href="/meetings"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Meetings
          </Link>
          <ChevronRightIcon className="size-4" />
          <span className="max-w-[200px] truncate">{meeting.title}</span>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-y-6 p-6">
            <div className="flex items-start justify-between gap-x-4">
              <div className="min-w-0 space-y-2">
                <h1 className="text-2xl font-semibold">{meeting.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <MeetingStatusBadge status={status} />
                  <Badge variant="outline" className="gap-1.5 font-normal">
                    <GeneratedAvatar
                      seed={meeting.host.name}
                      variant="initials"
                      className="size-3.5"
                    />
                    Hosted by {meeting.host.name}
                  </Badge>
                  {meeting.agent && (
                    <Badge variant="outline" className="gap-1.5 font-normal">
                      <BotIcon className="size-3.5" />
                      {meeting.agent.name}
                    </Badge>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Meeting actions">
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <PencilIcon className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <TrashIcon className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {status === "active" ? (
              <Button className="w-full sm:w-fit" asChild>
                <Link href={`/call/${meetingId}`}>
                  <VideoIcon className="size-4" />
                  Join meeting
                </Link>
              </Button>
            ) : (
              <Button disabled variant="outline" className="w-full sm:w-fit">
                <VideoIcon className="size-4" />
                {status === "completed" ? "Meeting ended" : "Join meeting"}
              </Button>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <span>{format(startsAt, "EEEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <ClockIcon className="size-4 text-muted-foreground" />
                <span>
                  {format(startsAt, "h:mm a")} &middot; {meeting.durationMinutes} min
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <UsersIcon className="size-4 text-muted-foreground" />
                <span>
                  {meeting.participants.length} participant
                  {meeting.participants.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {meeting.description && (
              <div className="space-y-1.5">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Description
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {meeting.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Participants
              </h2>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((participant) => (
                  <Badge key={participant} variant="secondary" className="gap-1.5 font-normal">
                    <GeneratedAvatar
                      seed={participant}
                      variant="initials"
                      className="size-4"
                    />
                    {participant}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ResponsiveDialog
        title="Edit meeting"
        description="Update this meeting's details"
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <MeetingForm
          defaultValues={{
            title: meeting.title,
            description: meeting.description ?? "",
            participants: meeting.participants,
            duration: meeting.durationMinutes,
            agentId: meeting.agent?.id,
            ...splitDateAndTime(startsAt),
          }}
          onSubmit={onUpdate}
          onCancel={() => setEditOpen(false)}
          isPending={updateMeeting.isPending}
          submitLabel="Save changes"
          pendingLabel="Saving..."
        />
      </ResponsiveDialog>

      <DeleteMeetingDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        meetingTitle={meeting.title}
        onConfirm={() => removeMeeting.mutate({ id: meetingId })}
        isPending={removeMeeting.isPending}
      />
    </div>
  );
};
