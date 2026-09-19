const mongoose = require("mongoose");

const chatMessageSchema =
    new mongoose.Schema(
        {
            chat: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chat",
                required: true,
                index: true,
            },

            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            role: {
                type: String,
                enum: ["user", "assistant"],
                required: true,
            },

            content: {
                type: String,
                required: true,
                trim: true,
                maxlength: 10000,
            },

            provider: {
                type: String,
                enum: [
                    "USER",
                    "GEMINI",
                    "GROQ",
                ],
                default: "USER",
            },
        },
        {
            timestamps: true,
        }
    );

chatMessageSchema.index({
    chat: 1,
    createdAt: 1,
});

chatMessageSchema.index({
    user: 1,
    createdAt: -1,
});

module.exports = mongoose.model(
    "ChatMessage",
    chatMessageSchema
);