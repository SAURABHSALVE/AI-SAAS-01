"use client";

import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { meetingSchema } from "@/modules/meetings/schemas";
import { splitDateAndTime } from "@/modules/meetings/lib/meeting-datetime";
import { useMeetingFilters } from "@/modules/meetings/ui/hooks/use-meeting-filters";
import { MeetingForm } from "@/modules/meetings/ui/components/meeting-form";
import { MeetingCard } from "@/modules/meetings/ui/components/meeting-card";
import { MeetingCardSkeletonGrid } from "@/modules/meetings/ui/components/meeting-card-skeleton";
import { DeleteMeetingDialog } from "@/modules/meetings/ui/components/delete-meeting-dialog";
import { MeetingsFilterTabs } from "@/modules/meetings/ui/components/meetings-filter-tabs";
import { MeetingsDurationFilter } from "@/modules/meetings/ui/components/meetings-duration-filter";
import { MeetingsEmptyState } from "@/modules/meetings/ui/components/meetings-empty-state";
import type { MeetingGetMany } from "@/modules/meetings/types";

export const MeetingsViewLoading = () => {
  return (
    <LoadingState
      title="Loading meetings..."
      description="Please wait while we fetch your meetings."
    />
  );
};

export const MeetingsViewError = () => {
  return (
    <ErrorState
      title="Failed to load meetings"
      description="Something went wrong while fetching your meetings. Please try again."
    />
  );
};

export const CreateMeetingDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Set false when the caller renders its own button to open this dialog. */
  showTrigger?: boolean;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.meetings.getMany.queryKey(),
        });
        toast.success("Meeting scheduled");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to schedule meeting");
      },
    })
  );

  return (
    <ResponsiveDialog
      title="Schedule meeting"
      description="Set up a new meeting and invite participants"
      trigger={
        showTrigger ? (
          <Button>
            <PlusIcon className="size-4" />
            New meeting
          </Button>
        ) : undefined
      }
      open={open}
      onOpenChange={onOpenChange}
    >
      <MeetingForm
        onSubmit={(values) => createMeeting.mutate(values)}
        onCancel={() => onOpenChange(false)}
        isPending={createMeeting.isPending}
        submitLabel="Schedule meeting"
        pendingLabel="Scheduling..."
      />
    </ResponsiveDialog>
  );
};

export const MeetingsView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    search,
    setSearch,
    filter,
    setFilter,
    durationFilter,
    setDurationFilter,
    debouncedSearch,
  } = useMeetingFilters();

  const { data: meetings, isFetching } = useQuery({
    ...trpc.meetings.getMany.queryOptions({
      search: debouncedSearch || undefined,
      filter,
      durationFilter,
    }),
    placeholderData: keepPreviousData,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingGetMany | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<MeetingGetMany | null>(null);

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.meetings.getMany.queryKey(),
        });
        toast.success("Meeting updated");
        setEditingMeeting(null);
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
        setDeletingMeeting(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete meeting");
      },
    })
  );

  if (!meetings) {
    return <MeetingsViewLoading />;
  }

  const hasNoMeetingsAtAll =
    meetings.length === 0 &&
    !search &&
    filter === "all" &&
    durationFilter === "any";

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
            <p className="text-sm text-muted-foreground">
              Schedule and manage your meetings
            </p>
          </div>

          <CreateMeetingDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>

        {hasNoMeetingsAtAll ? (
          <MeetingsEmptyState
            variant="no-meetings"
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon className="size-4" />
                New meeting
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search meetings by title..."
                  className="border-none bg-background pl-8 pr-8 shadow-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {isFetching && (
                  <Loader2Icon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <MeetingsFilterTabs value={filter} onChange={setFilter} />
                <MeetingsDurationFilter
                  value={durationFilter}
                  onChange={setDurationFilter}
                />
              </div>
            </div>

            {isFetching && !meetings ? (
              <MeetingCardSkeletonGrid />
            ) : meetings.length === 0 ? (
              <MeetingsEmptyState variant="no-results" search={search} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {meetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onEdit={() => setEditingMeeting(meeting)}
                    onDelete={() => setDeletingMeeting(meeting)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ResponsiveDialog
        title="Edit meeting"
        description="Update this meeting's details"
        open={!!editingMeeting}
        onOpenChange={(open) => !open && setEditingMeeting(null)}
      >
        {editingMeeting && (
          <MeetingForm
            defaultValues={{
              title: editingMeeting.title,
              description: editingMeeting.description ?? "",
              participants: editingMeeting.participants,
              duration: editingMeeting.durationMinutes,
              agentId: editingMeeting.agent?.id,
              ...splitDateAndTime(new Date(editingMeeting.startsAt)),
            }}
            onSubmit={(values: z.infer<typeof meetingSchema>) =>
              updateMeeting.mutate({ id: editingMeeting.id, ...values })
            }
            onCancel={() => setEditingMeeting(null)}
            isPending={updateMeeting.isPending}
            submitLabel="Save changes"
            pendingLabel="Saving..."
          />
        )}
      </ResponsiveDialog>

      <DeleteMeetingDialog
        open={!!deletingMeeting}
        onOpenChange={(open) => !open && setDeletingMeeting(null)}
        meetingTitle={deletingMeeting?.title ?? ""}
        onConfirm={() => deletingMeeting && removeMeeting.mutate({ id: deletingMeeting.id })}
        isPending={removeMeeting.isPending}
      />
    </div>
  );
};
