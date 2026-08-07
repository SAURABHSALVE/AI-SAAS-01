import { BotIcon, SparklesIcon, VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface HomeEmptyStateProps {
  onCreateMeeting: () => void;
  onCreateAgent: () => void;
}

export const HomeEmptyState = ({ onCreateMeeting, onCreateAgent }: HomeEmptyStateProps) => {
  return (
    <Empty className="border bg-linear-to-b from-primary/5 to-transparent py-16">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-14 rounded-2xl bg-primary/10 text-primary [&_svg:not([class*='size-'])]:size-7"
        >
          <SparklesIcon />
        </EmptyMedia>
        <EmptyTitle className="text-xl">Welcome to Meet.AI</EmptyTitle>
        <EmptyDescription>
          Schedule a meeting or create an AI agent to get started. Meet.AI
          transcribes your calls, generates insights automatically, and lets
          you chat with the meeting afterward.
        </EmptyDescription>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onCreateMeeting}>
            <VideoIcon className="size-4" />
            Schedule your first meeting
          </Button>
          <Button variant="outline" onClick={onCreateAgent}>
            <BotIcon className="size-4" />
            Create an agent
          </Button>
        </div>
      </EmptyHeader>
    </Empty>
  );
};
