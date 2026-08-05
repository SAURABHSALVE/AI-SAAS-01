import { SearchIcon, VideoIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface MeetingsEmptyStateProps {
  variant: "no-meetings" | "no-results";
  search?: string;
  action?: React.ReactNode;
}

export const MeetingsEmptyState = ({
  variant,
  search,
  action,
}: MeetingsEmptyStateProps) => {
  if (variant === "no-results") {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchIcon />
          </EmptyMedia>
          <EmptyTitle>No meetings found</EmptyTitle>
          <EmptyDescription>
            {search
              ? `No meetings match "${search}". Try a different search.`
              : "No meetings match the current filter."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <VideoIcon />
        </EmptyMedia>
        <EmptyTitle>No meetings yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t scheduled any meetings. Create one to get started.
        </EmptyDescription>
        {action && <div className="mt-4">{action}</div>}
      </EmptyHeader>
    </Empty>
  );
};
