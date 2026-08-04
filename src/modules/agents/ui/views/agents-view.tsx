"use client";

import { useState } from "react";
import Link from "next/link";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { BotIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { useTRPC } from "@/trpc/client";
import { agentSchema } from "@/modules/agents/schemas";
import { AgentForm } from "@/modules/agents/ui/components/agent-form";

const AgentCreateDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.agents.getMany.queryKey(),
        });

        toast.success("Agent created");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create agent");
      },
    })
  );

  const onSubmit = (values: z.infer<typeof agentSchema>) => {
    createAgent.mutate(values);
  };

  return (
    <ResponsiveDialog
      title="Create agent"
      description="Create a new agent"
      trigger={<Button>Create agent</Button>}
      open={open}
      onOpenChange={onOpenChange}
    >
      <AgentForm
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
        isPending={createAgent.isPending}
        submitLabel="Create agent"
        pendingLabel="Creating..."
      />
    </ResponsiveDialog>
  );
};

export const AgentsViewLoading = () => {
  return (
    <LoadingState
      title="Loading agents..."
      description="Please wait while we fetch your agents."
    />
  );
};

export const AgentsViewError = () => {
  return (
    <ErrorState
      title="Failed to load agents"
      description="Something went wrong while fetching your agents. Please try again."
    />
  );
};

export const AgentsView = () => {
  const trpc = useTRPC();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: agents, isFetching } = useQuery({
    ...trpc.agents.getMany.queryOptions({
      search: debouncedSearch || undefined,
    }),
    placeholderData: keepPreviousData,
  });
  const [open, setOpen] = useState(false);

  if (!agents) {
    return <AgentsViewLoading />;
  }

  if (agents.length === 0 && !search) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BotIcon />
            </EmptyMedia>
            <EmptyTitle>No agents yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any agents. Create one to get started.
            </EmptyDescription>

            <div className="mt-4">
              <AgentCreateDialog open={open} onOpenChange={setOpen} />
            </div>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agents</h1>
            <p className="text-sm text-muted-foreground">
              Manage your AI agents
            </p>
          </div>

          <AgentCreateDialog open={open} onOpenChange={setOpen} />
        </div>

        <div className="flex items-center gap-x-3">
          <div className="relative max-w-sm flex-1">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter agents by name..."
              className="pl-8 pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isFetching && (
              <Loader2Icon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {agents.length} agent{agents.length === 1 ? "" : "s"}
          </span>
        </div>

        {agents.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No agents found</EmptyTitle>
              <EmptyDescription>
                No agents match &quot;{search}&quot;. Try a different search.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`}>
                <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-sm">
                  <CardHeader className="flex-row items-start gap-4 space-y-0">
                    <GeneratedAvatar
                      seed={agent.name}
                      variant="botttsNeutral"
                      className="size-10"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="truncate">{agent.name}</CardTitle>
                      {agent.description ? (
                        <CardDescription className="line-clamp-2">
                          {agent.description}
                        </CardDescription>
                      ) : (
                        <CardDescription className="italic">
                          No description
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
