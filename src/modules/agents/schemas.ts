import { z } from "zod";

import { TEMPERATURE_MAX, TEMPERATURE_MIN } from "./constants";

export const agentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, "Category is required"),

  systemPrompt: z.string().min(1, "System prompt is required").max(4000),
  personality: z.string().max(500).optional(),
  greeting: z.string().max(300).optional(),
  suggestedQuestions: z.array(z.string().min(1)).max(6),

  model: z.string().min(1, "Model is required"),
  temperature: z
    .number()
    .min(TEMPERATURE_MIN, `Minimum temperature is ${TEMPERATURE_MIN}`)
    .max(TEMPERATURE_MAX, `Maximum temperature is ${TEMPERATURE_MAX}`),
  voice: z.string().min(1, "Voice is required"),
  avatar: z.string().optional(),

  visibility: z.enum(["public", "private"]),
});

export const agentUpdateSchema = agentSchema.extend({
  id: z.string().min(1, "Id is required"),
});

export type AgentFormValues = z.infer<typeof agentSchema>;
