"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ParticipantsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ParticipantsInput = ({
  value,
  onChange,
  disabled,
  ...props
}: ParticipantsInputProps) => {
  const [draft, setDraft] = useState("");
  const inputId = useId();

  const commitDraft = () => {
    const email = draft.trim().replace(/,$/, "");
    if (!email) return;

    if (EMAIL_PATTERN.test(email) && !value.includes(email)) {
      onChange([...value, email]);
    }
    setDraft("");
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (draft.trim()) {
        e.preventDefault();
        commitDraft();
      }
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      removeAt(value.length - 1);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {value.map((email, index) => (
        <Badge key={email} variant="secondary" className="gap-1 font-normal">
          {email}
          <button
            type="button"
            onClick={() => removeAt(index)}
            disabled={disabled}
            aria-label={`Remove ${email}`}
            className="rounded-full outline-none hover:text-destructive focus-visible:ring-1 focus-visible:ring-ring"
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <Input
        id={inputId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commitDraft}
        disabled={disabled}
        placeholder={value.length === 0 ? "email@company.com" : ""}
        className="h-6 flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
        {...props}
      />
    </div>
  );
};
