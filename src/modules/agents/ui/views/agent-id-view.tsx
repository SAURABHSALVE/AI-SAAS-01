"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ChevronRightIcon,
  MoreVerticalIcon,
  PencilIcon,
  SparklesIcon,
  TrashIcon,
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
import { agentSchema } from "@/modules/agents/schemas";
import { AgentForm } from "@/modules/agents/ui/components/agent-form";
import { DeleteAgentDialog } from "@/modules/agents/ui/components/delete-agent-dialog";

interface Props {
  agentId: string;
}

export const AgentIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading agent..."
      description="Please wait while we fetch the agent details."
    />
  );
};

export const AgentIdViewError = () => {
  return (
    <ErrorState
      title="Failed to load agent"
      description="Something went wrong while fetching this agent. Please try again."
    />
  );
};

export const AgentIdView = ({ agentId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: agent } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.agents.getMany.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.agents.getOne.queryKey({ id: agentId }),
          }),
        ]);
        toast.success("Agent updated");
        setEditOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update agent");
      },
    })
  );

  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.agents.getMany.queryKey(),
        });
        toast.success("Agent deleted");
        router.push("/agents");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete agent");
        setDeleteOpen(false);
      },
    })
  );

  const onUpdate = (values: z.infer<typeof agentSchema>) => {
    updateAgent.mutate({ id: agentId, ...values });
  };

  const onDelete = () => {
    removeAgent.mutate({ id: agentId });
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-1 text-sm text-muted-foreground">
          <Link
            href="/agents"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Agents
          </Link>
          <ChevronRightIcon className="size-4" />
          <span className="max-w-[200px] truncate">{agent.name}</span>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-y-6 p-6">
            <div className="flex items-start justify-between gap-x-4">
              <div className="flex items-start gap-x-4">
                <GeneratedAvatar
                  seed={agent.name}
                  variant="botttsNeutral"
                  className="size-14"
                />
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-semibold">{agent.name}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5">
                      <SparklesIcon className="size-3" />
                      AI Agent
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 font-normal">
                      <VideoIcon className="size-3" />
                      Used in {agent.meetingCount} meeting
                      {agent.meetingCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
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

            {agent.description && (
              <div className="space-y-1.5">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Description
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {agent.description}
                </p>
              </div>
            )}

            {agent.instructions ? (
              <div className="space-y-1.5">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Instructions
                </h2>
                <p className="whitespace-pre-wrap rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
                  {agent.instructions}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No instructions set for this agent yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ResponsiveDialog
        title="Edit agent"
        description="Update this agent's details"
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <AgentForm
          defaultValues={{
            name: agent.name,
            description: agent.description ?? "",
            instructions: agent.instructions ?? "",
          }}
          onSubmit={onUpdate}
          onCancel={() => setEditOpen(false)}
          isPending={updateAgent.isPending}
          submitLabel="Save changes"
          pendingLabel="Saving..."
        />
      </ResponsiveDialog>

      <DeleteAgentDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        agentName={agent.name}
        onConfirm={onDelete}
        isPending={removeAgent.isPending}
      />
    </div>
  );
};
