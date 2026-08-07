import "server-only";
import { cosineDistance, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { meetingTranscriptChunks } from "@/db/schema";
import { embedText } from "./embed-text";

const TOP_K = 8;
const MIN_SIMILARITY = 0.3;

export interface RetrievedChunk {
  id: string;
  content: string;
  speakerName: string | null;
  startTs: number | null;
  similarity: number;
}

/** Cosine-similarity search over a single meeting's transcript chunks, via pgvector. */
export const searchTranscript = async (
  meetingId: string,
  query: string
): Promise<RetrievedChunk[]> => {
  const queryEmbedding = await embedText(query, "RETRIEVAL_QUERY");
  const distance = cosineDistance(meetingTranscriptChunks.embedding, queryEmbedding);

  const rows = await db
    .select({
      id: meetingTranscriptChunks.id,
      content: meetingTranscriptChunks.content,
      speakerName: meetingTranscriptChunks.speakerName,
      startTs: meetingTranscriptChunks.startTs,
      similarity: sql<number>`1 - (${distance})`,
    })
    .from(meetingTranscriptChunks)
    .where(eq(meetingTranscriptChunks.meetingId, meetingId))
    .orderBy(distance)
    .limit(TOP_K);

  return rows.filter((row) => row.similarity >= MIN_SIMILARITY);
};
