import { CalendarIcon, CheckSquareIcon, UserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionItem, FollowUpTask } from "@/db/schema";

interface ActionItemsCardProps {
  actionItems: ActionItem[];
  followUpTasks: FollowUpTask[];
}

export const ActionItemsCard = ({ actionItems, followUpTasks }: ActionItemsCardProps) => {
  const hasContent = actionItems.length > 0 || followUpTasks.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckSquareIcon className="size-4 text-primary" />
          Action items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasContent ? (
          <p className="text-sm text-muted-foreground">No action items were identified.</p>
        ) : (
          <ul className="space-y-3">
            {actionItems.map((item, index) => (
              <li key={`action-${index}`} className="flex items-start gap-3 text-sm">
                <CheckSquareIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p>{item.text}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.owner && (
                      <Badge variant="secondary" className="gap-1 font-normal">
                        <UserIcon className="size-3" />
                        {item.owner}
                      </Badge>
                    )}
                    {item.dueDate && (
                      <Badge variant="outline" className="gap-1 font-normal">
                        <CalendarIcon className="size-3" />
                        {item.dueDate}
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {followUpTasks.map((task, index) => (
              <li key={`followup-${index}`} className="flex items-start gap-3 text-sm">
                <CheckSquareIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p>{task.task}</p>
                  {task.owner && (
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <UserIcon className="size-3" />
                      {task.owner}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
