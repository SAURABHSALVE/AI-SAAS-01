import type { TranscriptEntry } from "@/db/schema";

export interface TranscriptChunk {
  index: number;
  content: string;
  speakerName: string | null;
  startTs: number;
  stopTs: number;
}

const MAX_CHUNK_CHARS = 1200;

/** Groups consecutive transcript turns into chunks, splitting on size rather than mid-sentence. */
export const chunkTranscript = (entries: TranscriptEntry[]): TranscriptChunk[] => {
  const chunks: TranscriptChunk[] = [];
  let buffer: TranscriptEntry[] = [];
  let bufferChars = 0;

  const flush = () => {
    if (buffer.length === 0) return;

    const speakerNames = [...new Set(buffer.map((e) => e.speakerName))];
    chunks.push({
      index: chunks.length,
      content: buffer.map((e) => `${e.speakerName}: ${e.text}`).join("\n"),
      speakerName: speakerNames.length === 1 ? speakerNames[0] : null,
      startTs: buffer[0].startTs,
      stopTs: buffer[buffer.length - 1].stopTs,
    });

    buffer = [];
    bufferChars = 0;
  };

  for (const entry of entries) {
    const entryChars = entry.text.length + entry.speakerName.length + 2;

    if (bufferChars + entryChars > MAX_CHUNK_CHARS && buffer.length > 0) {
      flush();
    }

    buffer.push(entry);
    bufferChars += entryChars;
  }

  flush();

  return chunks;
};
