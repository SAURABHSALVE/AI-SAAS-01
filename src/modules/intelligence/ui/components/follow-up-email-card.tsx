"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FollowUpEmailCardProps {
  email: string;
}

export const FollowUpEmailCard = ({ email }: FollowUpEmailCardProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MailIcon className="size-4 text-primary" />
          Follow-up email
        </CardTitle>
        <Button size="sm" variant="outline" onClick={onCopy}>
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
          {email}
        </p>
      </CardContent>
    </Card>
  );
};
