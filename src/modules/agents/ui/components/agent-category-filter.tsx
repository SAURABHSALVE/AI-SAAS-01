"use client";

import { TagIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_OPTIONS } from "@/modules/agents/constants";

interface AgentCategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const AgentCategoryFilter = ({ value, onChange }: AgentCategoryFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="w-[160px]" aria-label="Filter by category">
        <TagIcon className="size-3.5 text-muted-foreground" />
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        {CATEGORY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
