const express = require("express");

const {
    createChat,
    getChats,
    getChatMessages,
    sendChatMessage,
    deleteChat,
} = require(
    "../controllers/chatController"
);

const {
    isAuthenticated,
} = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.use(isAuthenticated);

router
    .route("/")
    .get(getChats)
    .post(createChat);

router.get(
    "/:chatId",
    getChatMessages
);

router.post(
    "/:chatId/messages",
    sendChatMessage
);

router.delete(
    "/:chatId",
    deleteChat
);

module.exports = router;