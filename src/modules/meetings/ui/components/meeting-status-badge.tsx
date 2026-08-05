import { CheckIcon, CircleIcon, RadioIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { MeetingStatus } from "../../lib/get-meeting-status";

const STATUS_CONFIG: Record<
  MeetingStatus,
  { label: string; icon: typeof CircleIcon; className: string }
> = {
  upcoming: {
    label: "Upcoming",
    icon: CircleIcon,
    className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  active: {
    label: "Live",
    icon: RadioIcon,
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  completed: {
    label: "Completed",
    icon: CheckIcon,
    className: "bg-muted text-muted-foreground",
  },
};

interface MeetingStatusBadgeProps {
  status: MeetingStatus;
  className?: string;
}

export const MeetingStatusBadge = ({
  status,
  className,
}: MeetingStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 border-0 font-medium", config.className, className)}
    >
      <Icon className={cn("size-3", status === "active" && "animate-pulse")} />
      {config.label}
    </Badge>
  );
};
