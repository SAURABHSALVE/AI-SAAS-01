import { Type, type Schema } from "@google/genai";
import { z } from "zod";

/** Gemini responseSchema — constrains generateContent's JSON output to this exact shape. */
export const INSIGHTS_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: {
      type: Type.STRING,
      description: "A concise 3-5 sentence executive summary of the meeting.",
    },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          owner: { type: Type.STRING, nullable: true },
          dueDate: { type: Type.STRING, nullable: true, description: "ISO date if mentioned, else null." },
        },
        required: ["text", "owner", "dueDate"],
      },
    },
    keyDecisions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          decision: { type: Type.STRING },
          context: { type: Type.STRING },
        },
        required: ["decision", "context"],
      },
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
        },
        required: ["risk", "severity"],
      },
    },
    deadlines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          date: { type: Type.STRING, description: "ISO date if known, else a descriptive phrase." },
        },
        required: ["item", "date"],
      },
    },
    followUpTasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          owner: { type: Type.STRING, nullable: true },
        },
        required: ["task", "owner"],
      },
    },
    followUpEmail: {
      type: Type.STRING,
      description: "A ready-to-send follow-up email summarizing outcomes and next steps.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-6 short freeform tags.",
    },
    topics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The main topics discussed.",
    },
    sentiment: {
      type: Type.STRING,
      enum: ["positive", "neutral", "negative", "mixed"],
    },
    sentimentScore: {
      type: Type.NUMBER,
      description: "Overall sentiment from -1 (very negative) to 1 (very positive).",
    },
    speakerInsights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speakerName: { type: Type.STRING },
          talkTimeSeconds: { type: Type.NUMBER },
          talkTimePercent: { type: Type.NUMBER },
          sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative", "mixed"] },
          keyContributions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "speakerName",
          "talkTimeSeconds",
          "talkTimePercent",
          "sentiment",
          "keyContributions",
        ],
      },
    },
    importantQuotes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING },
          speaker: { type: Type.STRING },
          timestamp: { type: Type.NUMBER, description: "Seconds from meeting start." },
        },
        required: ["quote", "speaker", "timestamp"],
      },
    },
    suggestedNextAgenda: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { item: { type: Type.STRING } },
        required: ["item"],
      },
    },
  },
  required: [
    "executiveSummary",
    "actionItems",
    "keyDecisions",
    "risks",
    "deadlines",
    "followUpTasks",
    "followUpEmail",
    "tags",
    "topics",
    "sentiment",
    "sentimentScore",
    "speakerInsights",
    "importantQuotes",
    "suggestedNextAgenda",
  ],
};

/** Runtime validation of Gemini's JSON output — defense in depth against schema drift. */
export const insightsResultSchema = z.object({
  executiveSummary: z.string(),
  actionItems: z.array(
    z.object({
      text: z.string(),
      owner: z.string().nullable(),
      dueDate: z.string().nullable(),
    })
  ),
  keyDecisions: z.array(z.object({ decision: z.string(), context: z.string() })),
  risks: z.array(
    z.object({ risk: z.string(), severity: z.enum(["low", "medium", "high"]) })
  ),
  deadlines: z.array(z.object({ item: z.string(), date: z.string() })),
  followUpTasks: z.array(z.object({ task: z.string(), owner: z.string().nullable() })),
  followUpEmail: z.string(),
  tags: z.array(z.string()),
  topics: z.array(z.string()),
  sentiment: z.enum(["positive", "neutral", "negative", "mixed"]),
  sentimentScore: z.number().min(-1).max(1),
  speakerInsights: z.array(
    z.object({
      speakerName: z.string(),
      talkTimeSeconds: z.number(),
      talkTimePercent: z.number(),
      sentiment: z.enum(["positive", "neutral", "negative", "mixed"]),
      keyContributions: z.array(z.string()),
    })
  ),
  importantQuotes: z.array(
    z.object({ quote: z.string(), speaker: z.string(), timestamp: z.number() })
  ),
  suggestedNextAgenda: z.array(z.object({ item: z.string() })),
});

export type InsightsResult = z.infer<typeof insightsResultSchema>;
