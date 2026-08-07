"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { SendIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Summarize the key decisions",
  "What are the action items?",
  "Were there any risks discussed?",
  "What deadlines were mentioned?",
];

interface MeetingChatPanelProps {
  meetingId: string;
}

export const MeetingChatPanel = ({ meetingId }: MeetingChatPanelProps) => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: `/api/meetings/${meetingId}/chat` }),
  });

  const isBusy = status === "submitted" || status === "streaming";

  const onSend = (text: string) => {
    if (!text.trim() || isBusy) return;
    void sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-[600px] flex-col rounded-lg border">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <SparklesIcon className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Ask anything about this meeting</p>
              <p className="text-sm text-muted-foreground">
                Answers are grounded in the transcript, with citations.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <Button key={prompt} variant="outline" size="sm" onClick={() => onSend(prompt)}>
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
            >
              {message.role === "assistant" && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <SparklesIcon className="size-3.5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <span key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          ))
        )}

        {status === "submitted" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SparklesIcon className="size-4 animate-pulse text-primary" />
            Thinking...
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend(input);
        }}
        className="flex items-center gap-2 border-t p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this meeting..."
          disabled={isBusy}
          aria-label="Ask about this meeting"
        />
        <Button type="submit" size="icon" disabled={isBusy || !input.trim()}>
          <SendIcon className="size-4" />
        </Button>
      </form>
    </div>
  );
};
