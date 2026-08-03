"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BotIcon, SearchIcon } from "lucide-react";

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
  const { data: agents } = useSuspenseQuery(trpc.agents.getMany.queryOptions());
  const [open, setOpen] = useState(false);

  if (agents.length === 0) {
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

            {/* Dialog trigger placed inside the Empty State */}
            <div className="mt-4">
              <ResponsiveDialog
                title="Create agent"
                description="Create a new agent"
                trigger={<Button>Create agent</Button>}
                open={open}
                onOpenChange={setOpen}
              >
                {/* Place your Agent Creation Form component here */}
                <div className="p-4">Agent creation form goes here</div>
              </ResponsiveDialog>
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

          {/* Dialog trigger for when agents already exist */}
          <ResponsiveDialog
            title="Create agent"
            description="Create a new agent"
            trigger={<Button>Create agent</Button>}
            open={open}
            onOpenChange={setOpen}
          >
            {/* Place your Agent Creation Form component here */}
            <div className="p-4">Agent creation form goes here</div>
          </ResponsiveDialog>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="h-full">
              <CardHeader className="flex-row items-start gap-4 space-y-0">
                <GeneratedAvatar
                  seed={agent.name}
                  variant="botttsNeutral"
                  className="size-10"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="truncate">{agent.name}</CardTitle>
                  {agent.description && (
                    <CardDescription className="line-clamp-2">
                      {agent.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};