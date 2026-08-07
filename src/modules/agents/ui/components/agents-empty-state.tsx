import { BotIcon, SearchIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface AgentsEmptyStateProps {
  variant: "no-agents" | "no-public-agents" | "no-results";
  search?: string;
  action?: React.ReactNode;
}

export const AgentsEmptyState = ({ variant, search, action }: AgentsEmptyStateProps) => {
  if (variant === "no-results") {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchIcon />
          </EmptyMedia>
          <EmptyTitle>No agents found</EmptyTitle>
          <EmptyDescription>
            {search
              ? `No agents match "${search}". Try a different search.`
              : "No agents match the current filters."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (variant === "no-public-agents") {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BotIcon />
          </EmptyMedia>
          <EmptyTitle>No public agents yet</EmptyTitle>
          <EmptyDescription>
            Nobody has published a public agent yet. Make one of yours public to
            share it here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BotIcon />
        </EmptyMedia>
        <EmptyTitle>No agents yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any agents. Create one to get started.
        </EmptyDescription>
        {action && <div className="mt-4">{action}</div>}
      </EmptyHeader>
    </Empty>
  );
};
