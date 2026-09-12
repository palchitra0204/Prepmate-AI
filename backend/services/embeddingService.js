const {
  GoogleGenAI,
} = require("@google/genai");

const getEmbeddingConfig = () => {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing in the .env file"
    );
  }

  const model =
    process.env.GEMINI_EMBEDDING_MODEL ||
    "gemini-embedding-001";

  const dimension = Number(
    process.env.EMBEDDING_DIMENSION ||
    768
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

const normalizeVector = (vector) => {
  if (
    !Array.isArray(vector) ||
    vector.length === 0
  ) {
    throw new Error(
      "Embedding API returned an empty vector"
    );
  }

  const magnitude = Math.sqrt(
    vector.reduce(
      (total, value) =>
        total + value * value,
      0
    )
  );

  if (!magnitude) {
    throw new Error(
      "Embedding vector magnitude is zero"
    );
  }

  return vector.map(
    (value) => value / magnitude
  );
};

const extractEmbeddingValues = (
  response
) => {
  const embedding =
    response?.embeddings?.[0];

  const values =
    embedding?.values ||
    embedding?.embedding?.values;

  if (
    !Array.isArray(values) ||
    values.length === 0
  ) {
    throw new Error(
      "Gemini did not return a valid embedding"
    );
  }

  return values;
};

/*
 * Single text ka embedding generate karta hai.
 */
const generateEmbedding = async ({
  text,
  taskType,
}) => {
  const cleanText =
    String(text || "").trim();

  if (!cleanText) {
    throw new Error(
      "Text is required for embedding generation"
    );
  }

  const {
    apiKey,
    model,
    dimension,
  } = getEmbeddingConfig();

  const ai = new GoogleGenAI({
    apiKey,
  });

  try {
    const response =
      await ai.models.embedContent({
        model,
        contents: cleanText,
        config: {
          taskType,
          outputDimensionality:
            dimension,
        },
      });

    const values =
      extractEmbeddingValues(response);

    return {
      embedding:
        normalizeVector(values),
      model,
      dimension: values.length,
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
 * Uploaded document chunk ka embedding.
 */
const generateDocumentEmbedding =
  async (text) => {
    return generateEmbedding({
      text,
      taskType:
        "RETRIEVAL_DOCUMENT",
    });
  };

/*
 * User query ka embedding.
 */
const generateQueryEmbedding = async (
  text
) => {
  return generateEmbedding({
    text,
    taskType: "RETRIEVAL_QUERY",
  });
};

/*
 * Multiple material chunks ke embeddings.
 *
 * Requests sequentially send ho rahi hain,
 * jisse rate-limit ka risk kam rahe.
 */
const generateDocumentEmbeddings =
  async (chunks = []) => {
    if (!Array.isArray(chunks)) {
      throw new Error(
        "Chunks must be an array"
      );
    }

    const embeddedChunks = [];

    for (const chunk of chunks) {
      const result =
        await generateDocumentEmbedding(
          chunk.content
        );

      embeddedChunks.push({
        ...chunk,
        embedding: result.embedding,
        embeddingModel: result.model,
        embeddingDimension:
          result.dimension,
      });
    }

    return embeddedChunks;
  };

module.exports = {
  generateEmbedding,
  generateDocumentEmbedding,
  generateQueryEmbedding,
  generateDocumentEmbeddings,
};