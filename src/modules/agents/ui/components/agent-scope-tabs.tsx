"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_SCOPES, type AgentScope } from "@/modules/agents/constants";

interface AgentScopeTabsProps {
  value: AgentScope;
  onChange: (value: AgentScope) => void;
}

export const AgentScopeTabs = ({ value, onChange }: AgentScopeTabsProps) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as AgentScope)}>
      <TabsList>
        {AGENT_SCOPES.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
