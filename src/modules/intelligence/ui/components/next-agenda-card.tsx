import { ListChecksIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgendaItem } from "@/db/schema";

interface NextAgendaCardProps {
  agenda: AgendaItem[];
}

export const NextAgendaCard = ({ agenda }: NextAgendaCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ListChecksIcon className="size-4 text-primary" />
          Suggested next agenda
        </CardTitle>
      </CardHeader>
      <CardContent>
        {agenda.length === 0 ? (
          <p className="text-sm text-muted-foreground">No follow-up agenda was suggested.</p>
        ) : (
          <ol className="space-y-2">
            {agenda.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums">
                  {index + 1}
                </span>
                <p>{item.item}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
