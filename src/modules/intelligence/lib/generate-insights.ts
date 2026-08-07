import "server-only";

import type { TranscriptEntry } from "@/db/schema";
import { gemini, GEMINI_INSIGHTS_MODEL } from "@/lib/gemini";
import {
  INSIGHTS_RESPONSE_SCHEMA,
  insightsResultSchema,
  type InsightsResult,
} from "./insights-schema";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatTranscript = (entries: TranscriptEntry[]) =>
  entries.map((e) => `[${formatTime(e.startTs)}] ${e.speakerName}: ${e.text}`).join("\n");

export const generateMeetingInsights = async (
  meetingTitle: string,
  entries: TranscriptEntry[]
): Promise<InsightsResult> => {
  const transcript = formatTranscript(entries);

  const response = await gemini.models.generateContent({
    model: GEMINI_INSIGHTS_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              `You are analyzing the transcript of a meeting titled "${meetingTitle}".`,
              "Extract structured intelligence from it. Be specific and ground everything",
              "in what was actually said — do not invent action items, decisions, or",
              "deadlines that weren't discussed. If a field has nothing to report, return",
              "an empty array (never omit a field).",
              "",
              "Transcript:",
              transcript,
            ].join("\n"),
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: INSIGHTS_RESPONSE_SCHEMA,
      temperature: 0.3,
    },
  });

  const raw = response.text;
  if (!raw) {
    throw new Error("Gemini returned an empty response while generating meeting insights");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "Gemini returned a malformed or truncated response while generating meeting insights"
    );
  }

  const result = insightsResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      "Gemini's response did not match the expected meeting insights format"
    );
  }

  return result.data;
};
