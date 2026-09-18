const mongoose =
    require("mongoose");


const materialSchema =
    new mongoose.Schema(
        {
            user: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "User",

                required:
                    true,

                index:
                    true,
            },

            title: {
                type:
                    String,

                required: [
                    true,
                    "Material title is required",
                ],

                trim:
                    true,

                maxlength:
                    150,
            },

            originalFileName: {
                type:
                    String,

                required:
                    true,

                trim:
                    true,
            },

            storedFileName: {
                type:
                    String,

                required:
                    true,
            },

            filePath: {
                type:
                    String,

                required:
                    true,
            },

            fileType: {
                type:
                    String,

                required:
                    true,

                enum: [
                    "PDF",
                    "DOCX",
                    "TXT",
                    "PPTX",
                ],
            },

            mimeType: {
                type:
                    String,

                required:
                    true,
            },

            fileSize: {
                type:
                    Number,

                required:
                    true,

                min:
                    1,
            },

            /*
             * Extracted document or
             * presentation text.
             */

            extractedText: {
                type:
                    String,

                default:
                    "",

                select:
                    false,
            },

            status: {
                type:
                    String,

                enum: [
                    "Uploaded",
                    "Processing",
                    "Ready",
                    "Failed",
                ],

                default:
                    "Uploaded",
            },

            processingError: {
                type:
                    String,

                default:
                    "",
            },

            processedAt: {
                type:
                    Date,

                default:
                    null,
            },

            /*
             * RAG indexing information.
             */

            ragStatus: {
                type:
                    String,

                enum: [
                    "Pending",
                    "Indexing",
                    "Ready",
                    "Failed",
                ],

                default:
                    "Pending",
            },

            ragChunkCount: {
                type:
                    Number,

                default:
                    0,

                min:
                    0,
            },

            ragEmbeddingModel: {
                type:
                    String,

                default:
                    "",
            },

            ragEmbeddingDimension: {
                type:
                    Number,

                default:
                    0,
            },

            ragIndexedAt: {
                type:
                    Date,

                default:
                    null,
            },

            ragError: {
                type:
                    String,

                default:
                    "",
            },
        },

        {
            timestamps:
                true,
        }
    );


materialSchema.index({
    user:
        1,

    createdAt:
        -1,
});


module.exports =
    mongoose.model(
        "Material",
        materialSchema
    );