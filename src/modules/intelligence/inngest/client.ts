import "server-only";
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "meeting-ai",
  isDev: process.env.NODE_ENV !== "production",
});

export interface MeetingTranscriptReadyEventData {
  meetingId: string;
}
