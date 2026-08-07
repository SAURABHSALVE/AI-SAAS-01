import { useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { AgentScope } from "../../constants";

export const useAgentFilters = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState<AgentScope>("mine");
  const debouncedSearch = useDebouncedValue(search, 300);

  return {
    search,
    setSearch,
    category,
    setCategory,
    scope,
    setScope,
    debouncedSearch,
  };
};
