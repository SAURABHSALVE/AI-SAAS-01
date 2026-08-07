import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { meetings, meetingTranscripts, user, type TranscriptEntry } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { inngest } from "@/modules/intelligence/inngest/client";

interface RawTranscriptLine {
  speaker_id?: string;
  text?: string;
  start_ts?: number;
  stop_ts?: number;
}

/** Stream sends epoch-millisecond timestamps; we store seconds relative to transcription start. */
const toRelativeSeconds = (ts: number | undefined, transcriptStartMs: number) => {
  if (!ts) return 0;
  if (ts > 10_000_000_000) {
    return Math.max(0, (ts - transcriptStartMs) / 1000);
  }
  return ts;
};

export async function POST(request: Request) {
  const signature = request.headers.get("x-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  let event;
  try {
    event = streamVideo.verifyAndParseWebhook(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type !== "call.transcription_ready") {
    return NextResponse.json({ received: true });
  }

  const { call_cid, call_transcription } = event;
  const meetingId = call_cid.split(":")[1];

  if (!meetingId) {
    return NextResponse.json({ error: "Could not resolve meeting id" }, { status: 400 });
  }

  const [meeting] = await db
    .select({ id: meetings.id })
    .from(meetings)
    .where(eq(meetings.id, meetingId));

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const transcriptResponse = await fetch(call_transcription.url);
  if (!transcriptResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch transcript file" }, { status: 502 });
  }

  const rawLines = (await transcriptResponse.text())
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as RawTranscriptLine)
    .filter((line) => !!line.speaker_id && !!line.text);

  if (rawLines.length === 0) {
    return NextResponse.json({ received: true, skipped: "empty transcript" });
  }

  const speakerIds = [...new Set(rawLines.map((line) => line.speaker_id!))];
  const speakers = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(inArray(user.id, speakerIds));
  const speakerNames = new Map(speakers.map((speaker) => [speaker.id, speaker.name]));

  const transcriptStartMs = new Date(call_transcription.start_time).getTime();

  const entries: TranscriptEntry[] = rawLines.map((line) => ({
    speakerId: line.speaker_id!,
    speakerName: speakerNames.get(line.speaker_id!) ?? "Unknown speaker",
    text: line.text!,
    startTs: toRelativeSeconds(line.start_ts, transcriptStartMs),
    stopTs: toRelativeSeconds(line.stop_ts, transcriptStartMs),
  }));

  await db
    .insert(meetingTranscripts)
    .values({
      meetingId,
      streamTranscriptUrl: call_transcription.url,
      entries,
    })
    .onConflictDoUpdate({
      target: meetingTranscripts.meetingId,
      set: { entries, streamTranscriptUrl: call_transcription.url },
    });

  await inngest.send({
    name: "meeting/transcript.ready",
    data: { meetingId },
  });

  return NextResponse.json({ received: true });
}
