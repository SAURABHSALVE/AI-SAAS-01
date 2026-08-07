"use client";

import type { Control } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SuggestedQuestionsInput } from "@/modules/agents/ui/components/suggested-questions-input";
import type { AgentFormValues } from "@/modules/agents/schemas";

interface AgentFormBehaviorSectionProps {
  control: Control<AgentFormValues>;
}

export const AgentFormBehaviorSection = ({ control }: AgentFormBehaviorSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="systemPrompt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>System prompt</FormLabel>
            <FormControl>
              <Textarea
                placeholder="You are a senior software engineer conducting a live coding interview..."
                className="min-h-32"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Defines how this agent behaves and responds during a meeting.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="personality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Personality</FormLabel>
            <FormControl>
              <Textarea placeholder="Sharp, patient, and constructively critical." {...field} />
            </FormControl>
            <FormDescription>A short tone descriptor, optional but helps consistency.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="greeting"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Greeting</FormLabel>
            <FormControl>
              <Input placeholder="Hi, thanks for joining — ready to get started?" {...field} />
            </FormControl>
            <FormDescription>What the agent says when it joins the call.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="suggestedQuestions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Suggested questions</FormLabel>
            <FormControl>
              <SuggestedQuestionsInput value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormDescription>Up to 6 starter questions shown to participants.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
