import { z } from "zod";

export const agentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  instructions: z.string().optional(),
});

export const agentUpdateSchema = agentSchema.extend({
  id: z.string().min(1, "Id is required"),
});
