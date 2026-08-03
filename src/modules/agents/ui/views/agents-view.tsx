"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { BotIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const AgentCreateDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof agentSchema>>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      description: "",
      instructions: "",
    },
  });

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.agents.getMany.queryKey(),
        });

        form.reset();
        onOpenChange(false);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Customer support assistant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Handles order questions and refunds"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional short summary shown on the agent card.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Be concise, polite, and collect order details before responding."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional system instructions used when the agent runs.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAgent.isPending}>
              {createAgent.isPending ? "Creating..." : "Create agent"}
            </Button>
          </div>
        </form>
      </Form>
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