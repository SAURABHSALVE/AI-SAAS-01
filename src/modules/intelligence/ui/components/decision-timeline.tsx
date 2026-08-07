import { GitCommitVerticalIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KeyDecision } from "@/db/schema";

interface DecisionTimelineProps {
  decisions: KeyDecision[];
}

export const DecisionTimeline = ({ decisions }: DecisionTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCommitVerticalIcon className="size-4 text-primary" />
          Key decisions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {decisions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No decisions were recorded.</p>
        ) : (
          <ol className="relative space-y-5 border-l pl-5">
            {decisions.map((decision, index) => (
              <li key={index} className="relative">
                <span className="absolute -left-[1.4rem] top-0.5 size-2.5 rounded-full border-2 border-background bg-primary" />
                <p className="text-sm font-medium leading-snug">{decision.decision}</p>
                <p className="mt-1 text-sm text-muted-foreground">{decision.context}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
