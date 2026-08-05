import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CallEndedProps {
  meetingId: string;
}

export const CallEnded = ({ meetingId }: CallEndedProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#101213] p-4 text-center text-white">
      <div className="flex size-14 items-center justify-center rounded-full bg-white/10">
        <CheckCircle2Icon className="size-7 text-emerald-400" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">You left the meeting</h1>
        <p className="text-sm text-white/60">Hope it went well.</p>
      </div>
      <Button variant="secondary" asChild>
        <Link href={`/meetings/${meetingId}`}>Back to meeting</Link>
      </Button>
    </div>
  );
};
