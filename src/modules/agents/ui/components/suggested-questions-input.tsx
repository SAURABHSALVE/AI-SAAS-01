"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface SuggestedQuestionsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  maxItems?: number;
}

export const SuggestedQuestionsInput = ({
  value,
  onChange,
  disabled,
  maxItems = 6,
}: SuggestedQuestionsInputProps) => {
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const atLimit = value.length >= maxItems;

  const commitDraft = () => {
    const question = draft.trim();
    if (!question || atLimit) {
      setDraft("");
      return;
    }

    if (!value.includes(question)) {
      onChange([...value, question]);
    }
    setDraft("");
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (draft.trim()) {
        e.preventDefault();
        commitDraft();
      }
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      removeAt(value.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1.5">
        {value.map((question, index) => (
          <Badge
            key={question}
            variant="secondary"
            className="w-fit max-w-full gap-1.5 font-normal"
          >
            <span className="truncate">{question}</span>
            <button
              type="button"
              onClick={() => removeAt(index)}
              disabled={disabled}
              aria-label={`Remove "${question}"`}
              className="shrink-0 rounded-full outline-none hover:text-destructive focus-visible:ring-1 focus-visible:ring-ring"
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Input
        id={inputId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commitDraft}
        disabled={disabled || atLimit}
        placeholder={
          atLimit ? `Maximum ${maxItems} questions` : "Type a question and press Enter"
        }
      />
    </div>
  );
};
