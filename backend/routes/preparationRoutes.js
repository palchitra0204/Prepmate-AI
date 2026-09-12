const express = require("express");

const {
  generatePreparation,
  getPreparationHistory,
  getPreparationById,
  deletePreparation,
} = require(
  "../controllers/preparationController"
);

const {
  isAuthenticated,
} = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

/*
 * Generate new preparation
 */
router.post(
  "/generate",
  isAuthenticated,
  generatePreparation
);

/*
 * Logged-in user history
 */
router.get(
  "/history",
  isAuthenticated,
  getPreparationHistory
);

/*
 * Single preparation result
 */
router.get(
  "/:id",
  isAuthenticated,
  getPreparationById
);

/*
 * Delete preparation result
 */
router.delete(
  "/:id",
  isAuthenticated,
  deletePreparation
);

module.exports = router;