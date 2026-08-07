import { QuoteIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImportantQuote } from "@/db/schema";

interface ImportantQuotesCardProps {
  quotes: ImportantQuote[];
}

const formatTimestamp = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const ImportantQuotesCard = ({ quotes }: ImportantQuotesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <QuoteIcon className="size-4 text-primary" />
          Important quotes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No standout quotes were captured.</p>
        ) : (
          <ul className="space-y-4">
            {quotes.map((quote, index) => (
              <li key={index} className="border-l-2 pl-3">
                <p className="text-sm italic leading-relaxed">&quot;{quote.quote}&quot;</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {quote.speaker} &middot; {formatTimestamp(quote.timestamp)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
