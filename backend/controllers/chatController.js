const mongoose = require("mongoose");

const Chat = require("../models/Chat");
const ChatMessage = require(
    "../models/ChatMessage"
);
const Material = require(
    "../models/Material"
);

const {
    generateChatAnswer,
} = require("../services/chatService");

const getUserId = (req) => {
    return req.user?._id || req.user?.id;
};

const createChat = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { materialId } = req.body;

        if (
            !mongoose.Types.ObjectId
                .isValid(materialId)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid material ID is required",
            });
        }

        const material =
            await Material.findOne({
                _id: materialId,
                user: userId,
            }).select(
                "title originalFileName status"
            );

        if (!material) {
            return res.status(404).json({
                success: false,
                message:
                    "Material not found",
            });
        }

        if (material.status !== "Ready") {
            return res.status(400).json({
                success: false,
                message:
                    "Material is not ready for chat",
            });
        }

        const chat = await Chat.create({
            user: userId,
            material: material._id,
            title:
                material.title ||
                "New Chat",
        });

        const populatedChat =
            await Chat.findById(
                chat._id
            ).populate(
                "material",
                "title originalFileName fileType status"
            );

        return res.status(201).json({
            success: true,
            message:
                "Chat created successfully",
            chat: populatedChat,
        });
    } catch (error) {
        console.error(
            "Create Chat Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to create chat",
        });
    }
};

const getChats = async (req, res) => {
    try {
        const userId = getUserId(req);

        const chats = await Chat.find({
            user: userId,
        })
            .populate(
                "material",
                "title originalFileName fileType status"
            )
            .sort({
                updatedAt: -1,
            })
            .lean();

        return res.status(200).json({
            success: true,
            count: chats.length,
            chats,
        });
    } catch (error) {
        console.error(
            "Get Chats Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load chats",
        });
    }
};

const getChatMessages =
    async (req, res) => {
        try {
            const userId =
                getUserId(req);

            const { chatId } =
                req.params;

            if (
                !mongoose.Types.ObjectId
                    .isValid(chatId)
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid chat ID",
                    });
            }

            const chat =
                await Chat.findOne({
                    _id: chatId,
                    user: userId,
                }).populate(
                    "material",
                    "title originalFileName fileType status"
                );

            if (!chat) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Chat not found",
                    });
            }

            const messages =
                await ChatMessage.find({
                    chat: chat._id,
                    user: userId,
                })
                    .sort({
                        createdAt: 1,
                    })
                    .lean();

            return res
                .status(200)
                .json({
                    success: true,
                    chat,
                    messages,
                });
        } catch (error) {
            console.error(
                "Get Chat Messages Error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        error.message ||
                        "Unable to load chat",
                });
        }
    };

const sendChatMessage =
    async (req, res) => {
        try {
            const userId =
                getUserId(req);

            const { chatId } =
                req.params;

            const question =
                String(
                    req.body.message || ""
                ).trim();

            if (
                !mongoose.Types.ObjectId
                    .isValid(chatId)
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid chat ID",
                    });
            }

            if (!question) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Message is required",
                    });
            }

            if (question.length > 5000) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Message is too long",
                    });
            }

            const chat =
                await Chat.findOne({
                    _id: chatId,
                    user: userId,
                });

            if (!chat) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Chat not found",
                    });
            }

            const material =
                await Material.findOne({
                    _id: chat.material,
                    user: userId,
                }).select(
                    "+extractedText title originalFileName status"
                );

            if (!material) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Chat material not found",
                    });
            }

            if (
                material.status !== "Ready"
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Material is not ready for chat",
                    });
            }

            if (
                !material.extractedText
                    ?.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Material does not contain readable text",
                    });
            }

            const previousMessages =
                await ChatMessage.find({
                    chat: chat._id,
                    user: userId,
                })
                    .sort({
                        createdAt: -1,
                    })
                    .limit(12)
                    .lean();

            previousMessages.reverse();

            const aiResult =
                await generateChatAnswer({
                    materialText:
                        material.extractedText,

                    materialTitle:
                        material.title ||
                        material.originalFileName,

                    previousMessages,

                    question,
                });

            const [
                userMessage,
                assistantMessage,
            ] = await ChatMessage.create([
                {
                    chat: chat._id,
                    user: userId,
                    role: "user",
                    content: question,
                    provider: "USER",
                },
                {
                    chat: chat._id,
                    user: userId,
                    role: "assistant",
                    content:
                        aiResult.answer,
                    provider:
                        aiResult.provider,
                },
            ]);

            const update = {
                lastMessage:
                    aiResult.answer.slice(
                        0,
                        300
                    ),

                $inc: {
                    messageCount: 2,
                },
            };

            if (
                chat.messageCount === 0 ||
                chat.title === "New Chat"
            ) {
                update.title =
                    question.length > 60
                        ? `${question.slice(
                            0,
                            60
                        )}...`
                        : question;
            }

            const updatedChat =
                await Chat.findByIdAndUpdate(
                    chat._id,
                    update,
                    {
                        new: true,
                    }
                ).populate(
                    "material",
                    "title originalFileName fileType status"
                );

            return res
                .status(201)
                .json({
                    success: true,

                    message:
                        "Message sent successfully",

                    chat:
                        updatedChat,

                    userMessage,

                    assistantMessage,
                });
        } catch (error) {
            console.error(
                "Send Chat Message Error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,

                    message:
                        error.message ||
                        "Unable to send message",
                });
        }
    };

const deleteChat = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { chatId } = req.params;

        if (
            !mongoose.Types.ObjectId
                .isValid(chatId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID",
            });
        }

        const chat =
            await Chat.findOneAndDelete({
                _id: chatId,
                user: userId,
            });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        await ChatMessage.deleteMany({
            chat: chat._id,
            user: userId,
        });

        return res.status(200).json({
            success: true,
            message:
                "Chat deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete Chat Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to delete chat",
        });
    }
};

module.exports = {
    createChat,
    getChats,
    getChatMessages,
    sendChatMessage,
    deleteChat,
};