"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agentSchema, type AgentFormValues } from "@/modules/agents/schemas";
import { AgentFormBehaviorSection } from "@/modules/agents/ui/components/agent-form-behavior-section";
import { AgentFormIdentitySection } from "@/modules/agents/ui/components/agent-form-identity-section";
import { AgentFormModelSection } from "@/modules/agents/ui/components/agent-form-model-section";
import { AgentFormVisibilitySection } from "@/modules/agents/ui/components/agent-form-visibility-section";

interface AgentFormProps {
  defaultValues?: Partial<AgentFormValues>;
  onSubmit: (values: AgentFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel: string;
  pendingLabel: string;
}

export const AgentForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
  pendingLabel,
}: AgentFormProps) => {
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      role: defaultValues?.role ?? "",
      description: defaultValues?.description ?? "",
      category: defaultValues?.category ?? "general",
      systemPrompt: defaultValues?.systemPrompt ?? "",
      personality: defaultValues?.personality ?? "",
      greeting: defaultValues?.greeting ?? "",
      suggestedQuestions: defaultValues?.suggestedQuestions ?? [],
      model: defaultValues?.model ?? "gemini-2.5-flash",
      temperature: defaultValues?.temperature ?? 0.7,
      voice: defaultValues?.voice ?? "Puck",
      avatar: defaultValues?.avatar ?? "",
      visibility: defaultValues?.visibility ?? "private",
    },
  });

  const nameValue = form.watch("name");
  const avatarValue = form.watch("avatar");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <Tabs defaultValue="identity">
          <TabsList className="w-full">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="model">Model &amp; voice</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="pt-4">
            <AgentFormIdentitySection
              control={form.control}
              nameValue={nameValue}
              avatarValue={avatarValue}
            />
          </TabsContent>

          <TabsContent value="behavior" className="pt-4">
            <AgentFormBehaviorSection control={form.control} />
          </TabsContent>

          <TabsContent value="model" className="pt-4">
            <AgentFormModelSection control={form.control} />
          </TabsContent>

          <TabsContent value="visibility" className="pt-4">
            <AgentFormVisibilitySection control={form.control} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 border-t pt-4">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
