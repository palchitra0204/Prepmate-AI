const mongoose = require("mongoose");

const MaterialChunk = require(
    "../models/MaterialChunk"
);

const {
    createTextChunks,
} = require("./chunkingService");

const {
    generateDocumentEmbeddings,
} = require("./embeddingService");

const {
    searchRelevantChunks,
} = require("./vectorSearchService");

/*
 * Preparation mode ke according
 * semantic-search query create karta hai.
 */
const createRAGQuery = ({
    mode,
    difficulty = "Medium",
}) => {
    if (mode === "MCQ") {
        return [
            "Find important concepts, facts,",
            "definitions and relationships",
            `for ${difficulty} difficulty`,
            "multiple-choice questions.",
        ].join(" ");
    }

    if (mode === "QUESTION_ANSWER") {
        return [
            "Find important concepts,",
            "definitions and explanations",
            `for ${difficulty} difficulty`,
            "questions and answers.",
        ].join(" ");
    }

    if (mode === "INTERVIEW") {
        return [
            "Find important practical concepts,",
            "applications and technical details",
            `for ${difficulty} difficulty`,
            "interview and viva questions.",
        ].join(" ");
    }

    return [
        "Find important concepts,",
        "definitions, facts and explanations",
        "from the study material.",
    ].join(" ");
};

/*
 * Material text ko chunks mein divide karke
 * embeddings MongoDB mein store karta hai.
 */
const indexMaterialForRAG = async ({
    materialId,
    userId,
    text,
}) => {
    if (
        !mongoose.Types.ObjectId.isValid(
            materialId
        )
    ) {
        throw new Error(
            "Invalid material ID for RAG indexing"
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {
        throw new Error(
            "Invalid user ID for RAG indexing"
        );
    }

    const cleanText =
        String(text || "").trim();

    if (!cleanText) {
        throw new Error(
            "Material text is required for RAG indexing"
        );
    }

    const chunks = createTextChunks(
        cleanText,
        {
            chunkSize: 320,
            chunkOverlap: 60,
        }
    );

    if (chunks.length === 0) {
        throw new Error(
            "No chunks were created from the material"
        );
    }

    /*
     * Re-indexing ke time purane chunks
     * delete karna zaroori hai.
     */
    await MaterialChunk.deleteMany({
        material: materialId,
        user: userId,
    });

    try {
        const embeddedChunks =
            await generateDocumentEmbeddings(
                chunks
            );

        if (
            !Array.isArray(
                embeddedChunks
            ) ||
            embeddedChunks.length === 0
        ) {
            throw new Error(
                "No embeddings were generated"
            );
        }

        const documents =
            embeddedChunks.map((chunk) => ({
                user: userId,
                material: materialId,

                chunkIndex:
                    chunk.chunkIndex,

                content:
                    chunk.content,

                wordCount:
                    chunk.wordCount,

                startWord:
                    chunk.startWord,

                endWord:
                    chunk.endWord,

                embedding:
                    chunk.embedding,

                embeddingModel:
                    chunk.embeddingModel,

                embeddingDimension:
                    chunk.embeddingDimension,
            }));

        await MaterialChunk.insertMany(
            documents
        );

        const firstChunk =
            embeddedChunks[0];

        return {
            success: true,

            chunkCount:
                documents.length,

            embeddingModel:
                firstChunk.embeddingModel,

            embeddingDimension:
                firstChunk.embeddingDimension,
        };
    } catch (error) {
        /*
         * Failed indexing ke incomplete
         * chunks delete karenge.
         */
        await MaterialChunk.deleteMany({
            material: materialId,
            user: userId,
        });

        throw error;
    }
};

/*
 * Relevant material chunks retrieve karta hai
 * aur LLM context create karta hai.
 */
const retrieveRAGContext = async ({
    materialId,
    userId,
    mode,
    difficulty,
    topK,
}) => {
    const query = createRAGQuery({
        mode,
        difficulty,
    });

    const chunks =
        await searchRelevantChunks({
            materialId,
            userId,
            query,
            topK,
        });

    if (
        !Array.isArray(chunks) ||
        chunks.length === 0
    ) {
        return {
            query,
            context: "",
            chunks: [],
        };
    }

    const context = chunks
        .map((chunk, index) => {
            return [
                `[Source ${index + 1}]`,
                chunk.content,
            ].join("\n");
        })
        .join("\n\n");

    return {
        query,
        context,

        chunks: chunks.map(
            (chunk) => ({
                chunkIndex:
                    chunk.chunkIndex,

                content:
                    chunk.content,

                score: Number(
                    Number(
                        chunk.score || 0
                    ).toFixed(4)
                ),
            })
        ),
    };
};

/*
 * Material delete hone par uske
 * stored RAG chunks bhi delete karta hai.
 */
const deleteMaterialRAGIndex =
    async ({
        materialId,
        userId,
    }) => {
        if (
            !mongoose.Types.ObjectId.isValid(
                materialId
            )
        ) {
            return {
                deletedCount: 0,
            };
        }

        const result =
            await MaterialChunk.deleteMany({
                material: materialId,
                user: userId,
            });

        return {
            deletedCount:
                result.deletedCount || 0,
        };
    };

module.exports = {
    createRAGQuery,
    indexMaterialForRAG,
    retrieveRAGContext,
    deleteMaterialRAGIndex,
};