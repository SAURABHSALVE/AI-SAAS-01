"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MEETING_FILTERS, type MeetingFilter } from "@/modules/meetings/constants";

interface MeetingsFilterTabsProps {
  value: MeetingFilter;
  onChange: (value: MeetingFilter) => void;
}

export const MeetingsFilterTabs = ({ value, onChange }: MeetingsFilterTabsProps) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as MeetingFilter)}>
      <TabsList>
        {MEETING_FILTERS.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
