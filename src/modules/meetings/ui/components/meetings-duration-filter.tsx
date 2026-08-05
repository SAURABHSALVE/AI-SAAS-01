"use client";

import { TimerIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MEETING_DURATION_FILTERS,
  type MeetingDurationFilter,
} from "@/modules/meetings/constants";

interface MeetingsDurationFilterProps {
  value: MeetingDurationFilter;
  onChange: (value: MeetingDurationFilter) => void;
}

export const MeetingsDurationFilter = ({
  value,
  onChange,
}: MeetingsDurationFilterProps) => {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as MeetingDurationFilter)}>
      <SelectTrigger size="sm" className="w-[160px]" aria-label="Filter by duration">
        <TimerIcon className="size-3.5 text-muted-foreground" />
        <SelectValue placeholder="Any duration" />
      </SelectTrigger>
      <SelectContent>
        {MEETING_DURATION_FILTERS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
