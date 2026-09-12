const {
    GoogleGenAI,
} = require("@google/genai");

const DEFAULT_MODEL =
    "gemini-embedding-001";

const DEFAULT_DIMENSION = 768;

const getEmbeddingClient = () => {
    if (
        !process.env.GEMINI_API_KEY
    ) {
        throw new Error(
            "GEMINI_API_KEY is missing in the .env file"
        );
    }

    return new GoogleGenAI({
        apiKey:
            process.env.GEMINI_API_KEY,
    });
};

const getEmbeddingModel = () => {
    return (
        process.env
            .GEMINI_EMBEDDING_MODEL ||
        DEFAULT_MODEL
    );
};

const getEmbeddingDimension =
    () => {
        const configuredDimension =
            Number(
                process.env
                    .EMBEDDING_DIMENSION
            );

        if (
            Number.isInteger(
                configuredDimension
            ) &&
            configuredDimension > 0
        ) {
            return configuredDimension;
        }

        return DEFAULT_DIMENSION;
    };

const extractEmbeddingValues = (
    response
) => {
    if (
        Array.isArray(
            response?.embeddings
        )
    ) {
        return response.embeddings.map(
            (embedding) =>
                embedding.values || []
        );
    }

    if (
        response?.embedding?.values
    ) {
        return [
            response.embedding.values,
        ];
    }

    return [];
};

const generateEmbedding = async ({
    text,
    taskType =
    "RETRIEVAL_QUERY",
    title,
}) => {
    if (!text?.trim()) {
        throw new Error(
            "Text is required to generate an embedding"
        );
    }

    const ai =
        getEmbeddingClient();

    const response =
        await ai.models.embedContent({
            model: getEmbeddingModel(),

            contents: text.trim(),

            config: {
                taskType,

                outputDimensionality:
                    getEmbeddingDimension(),

                autoTruncate: true,

                ...(title
                    ? {
                        title:
                            title.slice(
                                0,
                                200
                            ),
                    }
                    : {}),
            },
        });

    const embeddings =
        extractEmbeddingValues(
            response
        );

    if (!embeddings[0]?.length) {
        throw new Error(
            "Gemini returned an empty embedding"
        );
    }

    return embeddings[0];
};

const generateDocumentEmbeddings =
    async ({
        texts,
        title,
        batchSize = 20,
    }) => {
        if (
            !Array.isArray(texts) ||
            texts.length === 0
        ) {
            return [];
        }

        const ai =
            getEmbeddingClient();

        const allEmbeddings = [];

        for (
            let index = 0;
            index < texts.length;
            index += batchSize
        ) {
            const batch = texts
                .slice(
                    index,
                    index + batchSize
                )
                .map((text) =>
                    text.trim()
                );

            const response =
                await ai.models.embedContent({
                    model:
                        getEmbeddingModel(),

                    contents: batch,

                    config: {
                        taskType:
                            "RETRIEVAL_DOCUMENT",

                        outputDimensionality:
                            getEmbeddingDimension(),

                        autoTruncate: true,

                        ...(title
                            ? {
                                title:
                                    title.slice(
                                        0,
                                        200
                                    ),
                            }
                            : {}),
                    },
                });

            const batchEmbeddings =
                extractEmbeddingValues(
                    response
                );

            if (
                batchEmbeddings.length !==
                batch.length
            ) {
                throw new Error(
                    "Gemini returned an unexpected number of embeddings"
                );
            }

            allEmbeddings.push(
                ...batchEmbeddings
            );
        }

        return allEmbeddings;
    };

module.exports = {
    generateEmbedding,
    generateDocumentEmbeddings,
    getEmbeddingModel,
    getEmbeddingDimension,
};