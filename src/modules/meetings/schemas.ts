import { z } from "zod";

export const meetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z
    .number({ error: "Duration is required" })
    .int()
    .min(5, "Minimum duration is 5 minutes")
    .max(480, "Maximum duration is 8 hours"),
  participants: z
    .array(z.string().email("Enter a valid email"))
    .min(1, "Add at least one participant"),
  agentId: z.string().optional(),
});

export const meetingUpdateSchema = meetingSchema.extend({
  id: z.string().min(1, "Id is required"),
});

export type MeetingFormValues = z.infer<typeof meetingSchema>;
