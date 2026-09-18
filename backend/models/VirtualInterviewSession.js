const mongoose = require("mongoose");

const interviewQuestionSchema =
    new mongoose.Schema(
        {
            questionNumber: {
                type: Number,
                required: true,
                min: 1,
            },

            question: {
                type: String,
                required: true,
                trim: true,
            },

            topic: {
                type: String,
                default: "",
                trim: true,
            },

            answerTranscript: {
                type: String,
                default: "",
                trim: true,
            },

            verdict: {
                type: String,
                enum: [
                    "Pending",
                    "Correct",
                    "Partially Correct",
                    "Incorrect",
                ],
                default: "Pending",
            },

            score: {
                type: Number,
                min: 0,
                max: 10,
                default: 0,
            },

            feedback: {
                type: String,
                default: "",
            },

            idealAnswer: {
                type: String,
                default: "",
            },

            strengths: {
                type: [String],
                default: [],
            },

            improvements: {
                type: [String],
                default: [],
            },

            answeredAt: {
                type: Date,
                default: null,
            },
        },
        {
            _id: true,
        }
    );

const virtualInterviewSessionSchema =
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

            interviewType: {
                type: String,
                enum: [
                    "STUDY_VIVA",
                    "RESUME_INTERVIEW",
                    "TECHNICAL_INTERVIEW",
                    "GENERAL_INTERVIEW",
                ],
                default: "STUDY_VIVA",
            },

            /*
             * STATIC:
             * All questions are generated at the start.
             *
             * DYNAMIC:
             * Next question depends on the previous answer.
             */
            questionStyle: {
                type: String,
                enum: [
                    "STATIC",
                    "DYNAMIC",
                ],
                required: [
                    true,
                    "Question style is required",
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
                max: 20,
                default: 10,
            },

            currentQuestionNumber: {
                type: Number,
                min: 1,
                default: 1,
            },

            questions: {
                type: [interviewQuestionSchema],
                default: [],
            },

            status: {
                type: String,
                enum: [
                    "Active",
                    "Completed",
                    "Cancelled",
                    "Failed",
                ],
                default: "Active",
                index: true,
            },

            averageScore: {
                type: Number,
                min: 0,
                max: 10,
                default: 0,
            },

            percentage: {
                type: Number,
                min: 0,
                max: 100,
                default: 0,
            },

            totalAnswered: {
                type: Number,
                min: 0,
                default: 0,
            },

            correctAnswers: {
                type: Number,
                min: 0,
                default: 0,
            },

            partiallyCorrectAnswers: {
                type: Number,
                min: 0,
                default: 0,
            },

            incorrectAnswers: {
                type: Number,
                min: 0,
                default: 0,
            },

            overallStrengths: {
                type: [String],
                default: [],
            },

            overallImprovements: {
                type: [String],
                default: [],
            },

            provider: {
                type: String,
                default: "Gemini",
            },

            startedAt: {
                type: Date,
                default: Date.now,
            },

            completedAt: {
                type: Date,
                default: null,
            },

            errorMessage: {
                type: String,
                default: "",
            },
        },
        {
            timestamps: true,
        }
    );

virtualInterviewSessionSchema.index({
    user: 1,
    createdAt: -1,
});

virtualInterviewSessionSchema.index({
    user: 1,
    material: 1,
    status: 1,
});

module.exports = mongoose.model(
    "VirtualInterviewSession",
    virtualInterviewSessionSchema
);