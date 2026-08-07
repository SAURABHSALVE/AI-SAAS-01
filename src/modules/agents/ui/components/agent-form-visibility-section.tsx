"use client";

import type { Control } from "react-hook-form";

import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import type { AgentFormValues } from "@/modules/agents/schemas";

interface AgentFormVisibilitySectionProps {
  control: Control<AgentFormValues>;
}

export const AgentFormVisibilitySection = ({ control }: AgentFormVisibilitySectionProps) => {
  return (
    <FormField
      control={control}
      name="visibility"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Public agent</p>
            <p className="text-sm text-muted-foreground">
              Public agents appear in the gallery and can be used by any user. Private
              agents are only visible to you.
            </p>
          </div>
          <FormControl>
            <Switch
              checked={field.value === "public"}
              onCheckedChange={(checked) => field.onChange(checked ? "public" : "private")}
              aria-label="Make agent public"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
