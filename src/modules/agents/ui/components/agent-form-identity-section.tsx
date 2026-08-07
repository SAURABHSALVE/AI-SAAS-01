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
import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_OPTIONS } from "@/modules/agents/constants";
import type { AgentFormValues } from "@/modules/agents/schemas";

interface AgentFormIdentitySectionProps {
  control: Control<AgentFormValues>;
  nameValue: string;
  avatarValue?: string;
}

export const AgentFormIdentitySection = ({
  control,
  nameValue,
  avatarValue,
}: AgentFormIdentitySectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <GeneratedAvatar
          seed={avatarValue || nameValue || "agent"}
          variant="botttsNeutral"
          className="size-12 shrink-0"
        />
        <FormField
          control={control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Avatar seed</FormLabel>
              <FormControl>
                <Input placeholder="Leave blank to use the name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Coding Interviewer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="Coding Interviewer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="What does this agent help with?" {...field} />
            </FormControl>
            <FormDescription>Shown on the agent card and gallery.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
