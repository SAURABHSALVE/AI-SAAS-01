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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { AGENT_TEMPLATES } from "@/modules/agents/constants";
import { agentSchema, type AgentFormValues } from "@/modules/agents/schemas";
import type { AgentGetMany } from "@/modules/agents/types";
import { AgentCard } from "@/modules/agents/ui/components/agent-card";
import { AgentCategoryFilter } from "@/modules/agents/ui/components/agent-category-filter";
import { AgentForm } from "@/modules/agents/ui/components/agent-form";
import { AgentScopeTabs } from "@/modules/agents/ui/components/agent-scope-tabs";
import { AgentsEmptyState } from "@/modules/agents/ui/components/agents-empty-state";
import { DeleteAgentDialog } from "@/modules/agents/ui/components/delete-agent-dialog";
import { useAgentFilters } from "@/modules/agents/ui/hooks/use-agent-filters";

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

export const CreateAgentDialog = ({
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
  const [templateIndex, setTemplateIndex] = useState<number | null>(null);

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.agents.getMany.queryKey(),
        });
        toast.success("Agent created");
        setTemplateIndex(null);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create agent");
      },
    })
  );

  const template = templateIndex !== null ? AGENT_TEMPLATES[templateIndex] : undefined;

  return (
    <ResponsiveDialog
      title="Create agent"
      description="Create a new AI agent"
      trigger={
        showTrigger ? (
          <Button>
            <PlusIcon className="size-4" />
            Create agent
          </Button>
        ) : undefined
      }
      open={open}
      onOpenChange={(next) => {
        if (!next) setTemplateIndex(null);
        onOpenChange(next);
      }}
    >
      <div className="space-y-3 px-4 pt-4">
        <p className="text-sm font-medium text-muted-foreground">
          Start from a template (optional)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {AGENT_TEMPLATES.map((t, index) => (
            <Badge
              key={t.name}
              variant={templateIndex === index ? "default" : "outline"}
              className="cursor-pointer font-normal"
              onClick={() => setTemplateIndex(index)}
            >
              {t.name}
            </Badge>
          ))}
        </div>
      </div>

      <AgentForm
        key={templateIndex ?? "blank"}
        defaultValues={template}
        onSubmit={(values: AgentFormValues) => createAgent.mutate(values)}
        onCancel={() => onOpenChange(false)}
        isPending={createAgent.isPending}
        submitLabel="Create agent"
        pendingLabel="Creating..."
      />
    </ResponsiveDialog>
  );
};

export const AgentsView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    search,
    setSearch,
    category,
    setCategory,
    scope,
    setScope,
    debouncedSearch,
  } = useAgentFilters();

  const { data: agents, isFetching } = useQuery({
    ...trpc.agents.getMany.queryOptions({
      search: debouncedSearch || undefined,
      category: category === "all" ? undefined : category,
      scope,
    }),
    placeholderData: keepPreviousData,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentGetMany | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<AgentGetMany | null>(null);

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.agents.getMany.queryKey(),
        });
        toast.success("Agent updated");
        setEditingAgent(null);
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
        setDeletingAgent(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete agent");
      },
    })
  );

  if (!agents) {
    return <AgentsViewLoading />;
  }

  const hasNoFilters = !search && category === "all";
  const hasNoAgentsAtAll = agents.length === 0 && hasNoFilters && scope === "mine";
  const hasNoPublicAgentsAtAll = agents.length === 0 && hasNoFilters && scope === "public";

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
            <p className="text-sm text-muted-foreground">
              Manage your AI agents and browse the public gallery
            </p>
          </div>

          <CreateAgentDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>

        <AgentScopeTabs value={scope} onChange={setScope} />

        {hasNoAgentsAtAll ? (
          <AgentsEmptyState
            variant="no-agents"
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon className="size-4" />
                Create agent
              </Button>
            }
          />
        ) : hasNoPublicAgentsAtAll ? (
          <AgentsEmptyState variant="no-public-agents" />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search agents by name..."
                  className="border-none bg-background pl-8 pr-8 shadow-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {isFetching && (
                  <Loader2Icon className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>

              <AgentCategoryFilter value={category} onChange={setCategory} />
            </div>

            {agents.length === 0 ? (
              <AgentsEmptyState variant="no-results" search={search} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onEdit={() => setEditingAgent(agent)}
                    onDelete={() => setDeletingAgent(agent)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ResponsiveDialog
        title="Edit agent"
        description="Update this agent's configuration"
        open={!!editingAgent}
        onOpenChange={(open) => !open && setEditingAgent(null)}
      >
        {editingAgent && (
          <AgentForm
            defaultValues={{
              name: editingAgent.name,
              role: editingAgent.role,
              description: editingAgent.description ?? "",
              category: editingAgent.category,
              systemPrompt: editingAgent.systemPrompt,
              personality: editingAgent.personality ?? "",
              greeting: editingAgent.greeting ?? "",
              suggestedQuestions: editingAgent.suggestedQuestions,
              model: editingAgent.model,
              temperature: editingAgent.temperature,
              voice: editingAgent.voice,
              avatar: editingAgent.avatar ?? "",
              visibility: editingAgent.visibility,
            }}
            onSubmit={(values: z.infer<typeof agentSchema>) =>
              updateAgent.mutate({ id: editingAgent.id, ...values })
            }
            onCancel={() => setEditingAgent(null)}
            isPending={updateAgent.isPending}
            submitLabel="Save changes"
            pendingLabel="Saving..."
          />
        )}
      </ResponsiveDialog>

      <DeleteAgentDialog
        open={!!deletingAgent}
        onOpenChange={(open) => !open && setDeletingAgent(null)}
        agentName={deletingAgent?.name ?? ""}
        onConfirm={() => deletingAgent && removeAgent.mutate({ id: deletingAgent.id })}
        isPending={removeAgent.isPending}
      />
    </div>
  );
};
