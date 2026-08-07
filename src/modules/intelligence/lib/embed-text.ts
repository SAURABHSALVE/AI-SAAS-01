import "server-only";

import { EMBEDDING_DIMENSIONS, gemini, GEMINI_EMBEDDING_MODEL } from "@/lib/gemini";

type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

export const embedTexts = async (
  texts: string[],
  taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT"
): Promise<number[][]> => {
  if (texts.length === 0) return [];

  const response = await gemini.models.embedContent({
    model: GEMINI_EMBEDDING_MODEL,
    contents: texts,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  if (!response.embeddings || response.embeddings.length !== texts.length) {
    throw new Error("Gemini embedding response did not match the number of inputs");
  }

  return response.embeddings.map((embedding) => {
    if (!embedding.values) {
      throw new Error("Gemini returned an embedding with no values");
    }
    return embedding.values;
  });
};

export const embedText = async (
  text: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT"
): Promise<number[]> => {
  const [embedding] = await embedTexts([text], taskType);
  return embedding;
};
