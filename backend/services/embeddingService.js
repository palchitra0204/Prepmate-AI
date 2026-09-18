const {
  GoogleGenAI,
} = require("@google/genai");


const DEFAULT_MODEL =
  "gemini-embedding-001";

const DEFAULT_DIMENSION = 768;


/*
 * Environment variables validate karke
 * embedding configuration return karta hai.
 */
const getEmbeddingConfig = () => {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing in the .env file"
    );
  }

  const model =
    process.env
      .GEMINI_EMBEDDING_MODEL ||
    DEFAULT_MODEL;

  const dimension = Number(
    process.env
      .EMBEDDING_DIMENSION ||
    DEFAULT_DIMENSION
  );

  if (
    !Number.isInteger(dimension) ||
    dimension < 128 ||
    dimension > 3072
  ) {
    throw new Error(
      "EMBEDDING_DIMENSION must be between 128 and 3072"
    );
  }

  return {
    apiKey,
    model,
    dimension,
  };
};


/*
 * Gemini client create karta hai.
 */
const getEmbeddingClient = () => {
  const {
    apiKey,
  } = getEmbeddingConfig();

  return new GoogleGenAI({
    apiKey,
  });
};


/*
 * Embedding model ka naam return karta hai.
 */
const getEmbeddingModel = () => {
  return getEmbeddingConfig().model;
};


/*
 * Configured embedding dimension
 * return karta hai.
 */
const getEmbeddingDimension = () => {
  return getEmbeddingConfig()
    .dimension;
};


/*
 * Vector ko normalize karta hai taaki
 * cosine similarity reliable rahe.
 */
const normalizeVector = (vector) => {
  if (
    !Array.isArray(vector) ||
    vector.length === 0
  ) {
    throw new Error(
      "Embedding API returned an empty vector"
    );
  }

  const numericVector =
    vector.map((value) =>
      Number(value)
    );

  const containsInvalidValue =
    numericVector.some(
      (value) =>
        !Number.isFinite(value)
    );

  if (containsInvalidValue) {
    throw new Error(
      "Embedding contains invalid numeric values"
    );
  }

  const magnitude = Math.sqrt(
    numericVector.reduce(
      (total, value) =>
        total +
        value * value,
      0
    )
  );

  if (!magnitude) {
    throw new Error(
      "Embedding vector magnitude is zero"
    );
  }

  return numericVector.map(
    (value) =>
      value / magnitude
  );
};


/*
 * Gemini response se saare embedding
 * vectors safely extract karta hai.
 */
const extractEmbeddingVectors = (
  response
) => {
  if (
    Array.isArray(
      response?.embeddings
    )
  ) {
    return response.embeddings.map(
      (item) => {
        return (
          item?.values ||
          item?.embedding?.values ||
          []
        );
      }
    );
  }

  if (
    Array.isArray(
      response?.embedding?.values
    )
  ) {
    return [
      response.embedding.values,
    ];
  }

  return [];
};


/*
 * Single text ka embedding generate karta hai.
 */
const generateEmbedding = async ({
  text,
  taskType =
  "RETRIEVAL_QUERY",
  title = "",
}) => {
  const cleanText =
    String(text || "").trim();

  if (!cleanText) {
    throw new Error(
      "Text is required for embedding generation"
    );
  }

  const {
    model,
    dimension,
  } = getEmbeddingConfig();

  const ai =
    getEmbeddingClient();

  try {
    const response =
      await ai.models.embedContent({
        model,

        contents:
          cleanText,

        config: {
          taskType,

          outputDimensionality:
            dimension,

          autoTruncate:
            true,

          ...(title &&
            taskType ===
            "RETRIEVAL_DOCUMENT"
            ? {
              title:
                String(
                  title
                )
                  .trim()
                  .slice(
                    0,
                    200
                  ),
            }
            : {}),
        },
      });

    const vectors =
      extractEmbeddingVectors(
        response
      );

    if (!vectors[0]?.length) {
      throw new Error(
        "Gemini did not return a valid embedding"
      );
    }

    const embedding =
      normalizeVector(
        vectors[0]
      );

    if (
      embedding.length !==
      dimension
    ) {
      throw new Error(
        `Expected embedding dimension ${dimension}, but received ${embedding.length}`
      );
    }

    return {
      embedding,
      model,
      dimension:
        embedding.length,
    };
  } catch (error) {
    console.error(
      "Gemini Embedding Error:",
      error.message
    );

    throw new Error(
      error.message ||
      "Unable to generate embedding"
    );
  }
};


/*
 * Uploaded document chunk ka
 * embedding generate karta hai.
 */
const generateDocumentEmbedding =
  async (
    text,
    title = ""
  ) => {
    return generateEmbedding({
      text,

      title,

      taskType:
        "RETRIEVAL_DOCUMENT",
    });
  };


/*
 * User search query ka embedding
 * generate karta hai.
 */
const generateQueryEmbedding =
  async (text) => {
    return generateEmbedding({
      text,

      taskType:
        "RETRIEVAL_QUERY",
    });
  };


/*
 * Multiple material chunks ke embeddings
 * sequentially generate karta hai.
 *
 * Sequential requests rate-limit ka risk
 * reduce karti hain.
 */
const generateDocumentEmbeddings =
  async (
    chunks = [],
    title = ""
  ) => {
    if (!Array.isArray(chunks)) {
      throw new Error(
        "Chunks must be an array"
      );
    }

    if (chunks.length === 0) {
      return [];
    }

    const embeddedChunks = [];

    for (const chunk of chunks) {
      const content =
        String(
          chunk?.content || ""
        ).trim();

      if (!content) {
        continue;
      }

      const result =
        await generateDocumentEmbedding(
          content,
          title
        );

      embeddedChunks.push({
        ...chunk,

        embedding:
          result.embedding,

        embeddingModel:
          result.model,

        embeddingDimension:
          result.dimension,
      });
    }

    if (
      embeddedChunks.length === 0
    ) {
      throw new Error(
        "No valid material chunks were available for embedding"
      );
    }

    return embeddedChunks;
  };


module.exports = {
  generateEmbedding,
  generateDocumentEmbedding,
  generateQueryEmbedding,
  generateDocumentEmbeddings,
  getEmbeddingModel,
  getEmbeddingDimension,
};