import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HomeStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  live?: boolean;
}

export const HomeStatCard = ({ label, value, icon: Icon, live }: HomeStatCardProps) => {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            live && value > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-semibold tabular-nums">{value}</span>
            {live && value > 0 && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};
