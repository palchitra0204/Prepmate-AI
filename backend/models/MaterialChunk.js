const mongoose = require("mongoose");

const materialChunkSchema =
    new mongoose.Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            material: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Material",
                required: true,
                index: true,
            },

            chunkIndex: {
                type: Number,
                required: true,
                min: 0,
            },

            content: {
                type: String,
                required: true,
                trim: true,
            },

            wordCount: {
                type: Number,
                required: true,
                min: 1,
            },

            startWord: {
                type: Number,
                default: 0,
            },

            endWord: {
                type: Number,
                default: 0,
            },

            embedding: {
                type: [Number],
                default: [],
                select: false,
            },

            embeddingModel: {
                type: String,
                default: "",
            },

            embeddingDimension: {
                type: Number,
                default: 0,
            },
        },
        {
            timestamps: true,
        }
    );

materialChunkSchema.index(
    {
        material: 1,
        chunkIndex: 1,
    },
    {
        unique: true,
    }
);

materialChunkSchema.index({
    user: 1,
    material: 1,
});

module.exports = mongoose.model(
    "MaterialChunk",
    materialChunkSchema
);