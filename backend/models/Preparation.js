const mongoose = require("mongoose");

const retrievedChunkSchema =
  new mongoose.Schema(
    {
      chunkIndex: {
        type: Number,
        default: 0,
      },

      content: {
        type: String,
        default: "",
      },

      score: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: false,
    }
  );

const preparationSchema =
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

      mode: {
        type: String,
        required: true,
        enum: [
          "MCQ",
          "QUESTION_ANSWER",
          "INTERVIEW",
        ],
      },

      difficulty: {
        type: String,
        enum: [
          "Easy",
          "Medium",
          "Hard",
        ],
        default: "Medium",
      },

      questionCount: {
        type: Number,
        min: 1,
        max: 50,
        default: 10,
      },

      content: {
        type: mongoose.Schema.Types.Mixed,
        default: [],
      },

      status: {
        type: String,
        enum: [
          "Generating",
          "Completed",
          "Failed",
        ],
        default: "Generating",
      },

      errorMessage: {
        type: String,
        default: "",
      },

      completedAt: {
        type: Date,
        default: null,
      },

      /*
       * RAG metadata
       */
      retrievalSystem: {
        type: String,
        enum: [
          "RAG",
          "FULL_TEXT_FALLBACK",
        ],
        default:
          "FULL_TEXT_FALLBACK",
      },

      ragQuery: {
        type: String,
        default: "",
      },

      retrievedChunks: {
        type: [retrievedChunkSchema],
        default: [],
      },

      /*
       * Agent generation metadata
       */
      generationSystem: {
        type: String,
        enum: [
          "MULTI_AGENT",
          "SINGLE_AGENT_FALLBACK",
        ],
        default:
          "SINGLE_AGENT_FALLBACK",
      },

      provider: {
        type: String,
        default: "Gemini",
      },

      materialAnalysis: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      qualityReview: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      agentTrace: {
        type: mongoose.Schema.Types.Mixed,
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

preparationSchema.index({
  user: 1,
  createdAt: -1,
});

preparationSchema.index({
  material: 1,
  mode: 1,
});

module.exports = mongoose.model(
  "Preparation",
  preparationSchema
);