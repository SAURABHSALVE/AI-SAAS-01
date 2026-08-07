import { FrownIcon, MehIcon, ShuffleIcon, SmileIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Sentiment = "positive" | "neutral" | "negative" | "mixed";

const SENTIMENT_CONFIG: Record<
  Sentiment,
  { label: string; icon: typeof SmileIcon; className: string }
> = {
  positive: {
    label: "Positive",
    icon: SmileIcon,
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  neutral: {
    label: "Neutral",
    icon: MehIcon,
    className: "bg-muted text-muted-foreground",
  },
  negative: {
    label: "Negative",
    icon: FrownIcon,
    className: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
  mixed: {
    label: "Mixed",
    icon: ShuffleIcon,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
};

interface SentimentBadgeProps {
  sentiment: Sentiment;
  score?: number;
  className?: string;
}

export const SentimentBadge = ({ sentiment, score, className }: SentimentBadgeProps) => {
  const config = SENTIMENT_CONFIG[sentiment];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn("gap-1.5 border-0 font-medium", config.className, className)}>
      <Icon className="size-3" />
      {config.label}
      {typeof score === "number" && (
        <span className="tabular-nums opacity-70">{score.toFixed(2)}</span>
      )}
    </Badge>
  );
};
