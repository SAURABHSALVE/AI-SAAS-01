import { useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { MeetingDurationFilter, MeetingFilter } from "../../constants";

export const useMeetingFilters = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MeetingFilter>("all");
  const [durationFilter, setDurationFilter] = useState<MeetingDurationFilter>("any");
  const debouncedSearch = useDebouncedValue(search, 300);

  return {
    search,
    setSearch,
    filter,
    setFilter,
    durationFilter,
    setDurationFilter,
    debouncedSearch,
  };
};
