const express = require("express");

const {
    startVirtualInterview,
    submitVirtualAnswer,
    getVirtualInterview,
    getVirtualInterviewHistory,
    completeVirtualInterview,
    deleteVirtualInterview,
} = require(
    "../controllers/virtualInterviewController"
);

const {
    isAuthenticated,
} = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

/*
 * Start a new static or dynamic
 * virtual interview.
 */
router.post(
    "/start",
    isAuthenticated,
    startVirtualInterview
);

/*
 * Logged-in user's virtual
 * interview history.
 *
 * This route must remain before /:id.
 */
router.get(
    "/history",
    isAuthenticated,
    getVirtualInterviewHistory
);

/*
 * Submit spoken-answer transcript.
 */
router.post(
    "/:id/answer",
    isAuthenticated,
    submitVirtualAnswer
);

/*
 * Complete an interview early.
 */
router.post(
    "/:id/complete",
    isAuthenticated,
    completeVirtualInterview
);

/*
 * Load one virtual interview session.
 */
router.get(
    "/:id",
    isAuthenticated,
    getVirtualInterview
);

/*
 * Delete one virtual interview session.
 */
router.delete(
    "/:id",
    isAuthenticated,
    deleteVirtualInterview
);

module.exports = router;