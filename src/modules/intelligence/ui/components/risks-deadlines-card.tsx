import { AlertTriangleIcon, CalendarClockIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Deadline, Risk } from "@/db/schema";

const SEVERITY_CLASSNAME: Record<Risk["severity"], string> = {
  low: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  high: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

interface RisksDeadlinesCardProps {
  risks: Risk[];
  deadlines: Deadline[];
}

export const RisksDeadlinesCard = ({ risks, deadlines }: RisksDeadlinesCardProps) => {
  const hasContent = risks.length > 0 || deadlines.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangleIcon className="size-4 text-primary" />
          Risks &amp; deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasContent ? (
          <p className="text-sm text-muted-foreground">No risks or deadlines were flagged.</p>
        ) : (
          <>
            {risks.map((risk, index) => (
              <div key={`risk-${index}`} className="flex items-start gap-3 text-sm">
                <Badge
                  variant="secondary"
                  className={cn("border-0 font-medium capitalize", SEVERITY_CLASSNAME[risk.severity])}
                >
                  {risk.severity}
                </Badge>
                <p className="flex-1">{risk.risk}</p>
              </div>
            ))}
            {deadlines.map((deadline, index) => (
              <div key={`deadline-${index}`} className="flex items-start gap-3 text-sm">
                <Badge variant="outline" className="gap-1 font-normal">
                  <CalendarClockIcon className="size-3" />
                  {deadline.date}
                </Badge>
                <p className="flex-1">{deadline.item}</p>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};
