const mongoose = require("mongoose");

const MaterialChunk = require(
    "../models/MaterialChunk"
);

const {
    generateQueryEmbedding,
} = require("./embeddingService");

/*
 * Do embedding vectors ke beech
 * cosine similarity calculate karta hai.
 */
const calculateCosineSimilarity = (
    vectorA,
    vectorB
) => {
    if (
        !Array.isArray(vectorA) ||
        !Array.isArray(vectorB) ||
        vectorA.length === 0 ||
        vectorA.length !== vectorB.length
    ) {
        return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (
        let index = 0;
        index < vectorA.length;
        index += 1
    ) {
        dotProduct +=
            vectorA[index] * vectorB[index];

        magnitudeA +=
            vectorA[index] *
            vectorA[index];

        magnitudeB +=
            vectorB[index] *
            vectorB[index];
    }

    if (
        magnitudeA === 0 ||
        magnitudeB === 0
    ) {
        return 0;
    }

    return (
        dotProduct /
        (Math.sqrt(magnitudeA) *
            Math.sqrt(magnitudeB))
    );
};

/*
 * Query ke liye relevant chunks search karta hai.
 */
const searchRelevantChunks = async ({
    materialId,
    userId,
    query,
    topK,
}) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            materialId
        )
    ) {
        throw new Error(
            "Invalid material ID for vector search"
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {
        throw new Error(
            "Invalid user ID for vector search"
        );
    }

    const cleanQuery =
        String(query || "").trim();

    if (!cleanQuery) {
        throw new Error(
            "Search query is required"
        );
    }

    const requestedTopK = Number(
        topK ||
        process.env.RAG_TOP_K ||
        6
    );

    const safeTopK =
        Number.isInteger(requestedTopK) &&
            requestedTopK > 0
            ? Math.min(requestedTopK, 20)
            : 6;

    const queryResult =
        await generateQueryEmbedding(
            cleanQuery
        );

    const chunks = await MaterialChunk.find({
        material: materialId,
        user: userId,
    })
        .select("+embedding")
        .lean();

    if (chunks.length === 0) {
        return [];
    }

    const compatibleChunks =
        chunks.filter((chunk) => {
            return (
                Array.isArray(chunk.embedding) &&
                chunk.embedding.length ===
                queryResult.embedding.length
            );
        });

    const rankedChunks =
        compatibleChunks
            .map((chunk) => ({
                id: chunk._id,
                material: chunk.material,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content,
                wordCount: chunk.wordCount,
                startWord: chunk.startWord,
                endWord: chunk.endWord,
                score:
                    calculateCosineSimilarity(
                        queryResult.embedding,
                        chunk.embedding
                    ),
            }))
            .sort(
                (firstChunk, secondChunk) =>
                    secondChunk.score -
                    firstChunk.score
            )
            .slice(0, safeTopK);

    return rankedChunks;
};

module.exports = {
    calculateCosineSimilarity,
    searchRelevantChunks,
};