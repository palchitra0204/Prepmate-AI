const mongoose = require("mongoose");

const Material = require(
    "../models/Material"
);

const VirtualInterviewSession =
    require(
        "../models/VirtualInterviewSession"
    );

const {
    generateStaticQuestions,
    generateInitialDynamicQuestion,
    evaluateVirtualAnswer,
} = require(
    "../services/virtualInterviewService"
);

const allowedInterviewTypes = [
    "STUDY_VIVA",
    "RESUME_INTERVIEW",
    "TECHNICAL_INTERVIEW",
    "GENERAL_INTERVIEW",
];

const allowedQuestionStyles = [
    "STATIC",
    "DYNAMIC",
];

const allowedDifficulties = [
    "Easy",
    "Medium",
    "Hard",
];

const calculateSessionSummary = (
    session
) => {
    const answeredQuestions =
        session.questions.filter(
            (item) =>
                item.verdict !== "Pending"
        );

    const totalAnswered =
        answeredQuestions.length;

    const totalScore =
        answeredQuestions.reduce(
            (sum, item) =>
                sum +
                Number(item.score || 0),
            0
        );

    const averageScore =
        totalAnswered > 0
            ? Math.round(
                (totalScore /
                    totalAnswered) *
                10
            ) / 10
            : 0;

    session.totalAnswered =
        totalAnswered;

    session.averageScore =
        averageScore;

    session.percentage =
        Math.round(
            averageScore * 10
        );

    session.correctAnswers =
        answeredQuestions.filter(
            (item) =>
                item.verdict === "Correct"
        ).length;

    session.partiallyCorrectAnswers =
        answeredQuestions.filter(
            (item) =>
                item.verdict ===
                "Partially Correct"
        ).length;

    session.incorrectAnswers =
        answeredQuestions.filter(
            (item) =>
                item.verdict === "Incorrect"
        ).length;

    session.overallStrengths = [
        ...new Set(
            answeredQuestions.flatMap(
                (item) =>
                    Array.isArray(
                        item.strengths
                    )
                        ? item.strengths
                        : []
            )
        ),
    ].slice(0, 10);

    session.overallImprovements = [
        ...new Set(
            answeredQuestions.flatMap(
                (item) =>
                    Array.isArray(
                        item.improvements
                    )
                        ? item.improvements
                        : []
            )
        ),
    ].slice(0, 10);
};

const startVirtualInterview =
    async (req, res) => {
        let session = null;

        try {
            const {
                materialId,
                interviewType =
                "STUDY_VIVA",
                questionStyle,
                difficulty = "Medium",
                questionCount = 10,
            } = req.body;

            if (!materialId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Material ID is required",
                });
            }

            if (!questionStyle) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please select STATIC or DYNAMIC question style",
                });
            }

            if (
                !mongoose.Types.ObjectId.isValid(
                    materialId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid material ID",
                });
            }

            if (
                !allowedInterviewTypes.includes(
                    interviewType
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid interview type",
                });
            }

            if (
                !allowedQuestionStyles.includes(
                    questionStyle
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Question style must be STATIC or DYNAMIC",
                });
            }

            if (
                !allowedDifficulties.includes(
                    difficulty
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Difficulty must be Easy, Medium or Hard",
                });
            }

            const totalQuestions =
                Number(questionCount);

            if (
                !Number.isInteger(
                    totalQuestions
                ) ||
                totalQuestions < 1 ||
                totalQuestions > 20
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Question count must be between 1 and 20",
                });
            }

            const material =
                await Material.findOne({
                    _id: materialId,
                    user: req.user._id,
                }).select("+extractedText");

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Material not found",
                });
            }

            if (
                material.status !== "Ready"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Material is not ready for virtual interview",
                });
            }

            if (
                !material.extractedText?.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "No readable text found in this material",
                });
            }

            let interviewQuestions = [];

            if (
                questionStyle === "STATIC"
            ) {
                interviewQuestions =
                    await generateStaticQuestions({
                        materialText:
                            material.extractedText,

                        difficulty,

                        questionCount:
                            totalQuestions,
                    });
            } else {
                const firstQuestion =
                    await generateInitialDynamicQuestion(
                        {
                            materialText:
                                material.extractedText,

                            interviewType,

                            difficulty,
                        }
                    );

                interviewQuestions = [
                    {
                        questionNumber: 1,

                        question:
                            firstQuestion.question,

                        topic:
                            firstQuestion.topic,

                        verdict: "Pending",
                    },
                ];
            }

            session =
                await VirtualInterviewSession.create(
                    {
                        user: req.user._id,

                        material:
                            material._id,

                        interviewType,

                        questionStyle,

                        difficulty,

                        questionCount:
                            totalQuestions,

                        currentQuestionNumber:
                            1,

                        questions:
                            interviewQuestions,

                        status: "Active",

                        provider: "Gemini",

                        startedAt:
                            new Date(),
                    }
                );

            await session.populate(
                "material",
                "title originalFileName fileType status"
            );

            return res
                .status(201)
                .json({
                    success: true,

                    message:
                        questionStyle ===
                            "STATIC"
                            ? "Static virtual interview started successfully"
                            : "Dynamic virtual interview started successfully",

                    session,
                });
        } catch (error) {
            console.error(
                "Start Virtual Interview Error:",
                error
            );

            if (session) {
                try {
                    session.status = "Failed";

                    session.errorMessage =
                        error.message ||
                        "Unable to start interview";

                    await session.save();
                } catch (saveError) {
                    console.error(
                        "Virtual Interview Save Error:",
                        saveError.message
                    );
                }
            }

            return res.status(500).json({
                success: false,

                message:
                    error.message ||
                    "Unable to start virtual interview",
            });
        }
    };

const submitVirtualAnswer =
    async (req, res) => {
        try {
            const { id } = req.params;

            const {
                answerTranscript,
            } = req.body;

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid virtual interview session ID",
                });
            }

            if (
                !answerTranscript?.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Answer transcript is required",
                });
            }

            const session =
                await VirtualInterviewSession.findOne(
                    {
                        _id: id,
                        user: req.user._id,
                    }
                );

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Virtual interview session not found",
                });
            }

            if (
                session.status !== "Active"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "This virtual interview is no longer active",
                });
            }

            const currentQuestion =
                session.questions.find(
                    (item) =>
                        item.questionNumber ===
                        session.currentQuestionNumber
                );

            if (!currentQuestion) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Current interview question was not found",
                });
            }

            if (
                currentQuestion.verdict !==
                "Pending"
            ) {
                return res.status(409).json({
                    success: false,
                    message:
                        "The current question has already been answered",
                });
            }

            const material =
                await Material.findOne({
                    _id: session.material,
                    user: req.user._id,
                }).select("+extractedText");

            if (
                !material ||
                !material.extractedText?.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Interview material is unavailable",
                });
            }

            const isFinalQuestion =
                session.currentQuestionNumber >=
                session.questionCount;

            const shouldGenerateNext =
                session.questionStyle ===
                "DYNAMIC" &&
                !isFinalQuestion;

            const evaluation =
                await evaluateVirtualAnswer({
                    materialText:
                        material.extractedText,

                    interviewType:
                        session.interviewType,

                    difficulty:
                        session.difficulty,

                    question:
                        currentQuestion.question,

                    answerTranscript:
                        answerTranscript.trim(),

                    previousQuestions:
                        session.questions,

                    generateNextQuestion:
                        shouldGenerateNext,
                });

            currentQuestion.answerTranscript =
                answerTranscript.trim();

            currentQuestion.verdict =
                evaluation.verdict;

            currentQuestion.score =
                evaluation.score;

            currentQuestion.feedback =
                evaluation.feedback;

            currentQuestion.idealAnswer =
                evaluation.idealAnswer;

            currentQuestion.strengths =
                evaluation.strengths;

            currentQuestion.improvements =
                evaluation.improvements;

            currentQuestion.answeredAt =
                new Date();

            let nextQuestion = null;

            if (isFinalQuestion) {
                session.status =
                    "Completed";

                session.completedAt =
                    new Date();
            } else {
                const nextQuestionNumber =
                    session.currentQuestionNumber +
                    1;

                if (
                    session.questionStyle ===
                    "DYNAMIC"
                ) {
                    session.questions.push({
                        questionNumber:
                            nextQuestionNumber,

                        question:
                            evaluation.nextQuestion
                                .question,

                        topic:
                            evaluation.nextQuestion
                                .topic,

                        verdict: "Pending",
                    });

                    nextQuestion = {
                        questionNumber:
                            nextQuestionNumber,

                        question:
                            evaluation.nextQuestion
                                .question,

                        topic:
                            evaluation.nextQuestion
                                .topic,
                    };
                } else {
                    const storedNextQuestion =
                        session.questions.find(
                            (item) =>
                                item.questionNumber ===
                                nextQuestionNumber
                        );

                    if (!storedNextQuestion) {
                        throw new Error(
                            "Next static interview question was not found"
                        );
                    }

                    nextQuestion = {
                        questionNumber:
                            storedNextQuestion
                                .questionNumber,

                        question:
                            storedNextQuestion
                                .question,

                        topic:
                            storedNextQuestion
                                .topic,
                    };
                }

                session.currentQuestionNumber =
                    nextQuestionNumber;
            }

            calculateSessionSummary(
                session
            );

            await session.save();

            return res.status(200).json({
                success: true,

                message: isFinalQuestion
                    ? "Virtual interview completed successfully"
                    : "Answer evaluated successfully",

                questionStyle:
                    session.questionStyle,

                evaluation: {
                    verdict:
                        evaluation.verdict,

                    score:
                        evaluation.score,

                    feedback:
                        evaluation.feedback,

                    idealAnswer:
                        evaluation.idealAnswer,

                    strengths:
                        evaluation.strengths,

                    improvements:
                        evaluation.improvements,
                },

                nextQuestion,

                completed:
                    session.status ===
                    "Completed",

                session,
            });
        } catch (error) {
            console.error(
                "Submit Virtual Answer Error:",
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    error.message ||
                    "Unable to evaluate virtual interview answer",
            });
        }
    };

const getVirtualInterview =
    async (req, res) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid virtual interview session ID",
                });
            }

            const session =
                await VirtualInterviewSession.findOne(
                    {
                        _id: req.params.id,
                        user: req.user._id,
                    }
                ).populate(
                    "material",
                    "title originalFileName fileType status"
                );

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Virtual interview session not found",
                });
            }

            return res.status(200).json({
                success: true,
                session,
            });
        } catch (error) {
            console.error(
                "Get Virtual Interview Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load virtual interview",
            });
        }
    };

const getVirtualInterviewHistory =
    async (req, res) => {
        try {
            const sessions =
                await VirtualInterviewSession.find(
                    {
                        user: req.user._id,
                    }
                )
                    .populate(
                        "material",
                        "title originalFileName fileType status"
                    )
                    .sort({
                        createdAt: -1,
                    });

            return res.status(200).json({
                success: true,
                count: sessions.length,
                sessions,
            });
        } catch (error) {
            console.error(
                "Virtual Interview History Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load virtual interview history",
            });
        }
    };

const completeVirtualInterview =
    async (req, res) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid virtual interview session ID",
                });
            }

            const session =
                await VirtualInterviewSession.findOne(
                    {
                        _id: req.params.id,
                        user: req.user._id,
                    }
                );

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Virtual interview session not found",
                });
            }

            if (
                session.status === "Active"
            ) {
                calculateSessionSummary(
                    session
                );

                session.status =
                    "Completed";

                session.completedAt =
                    new Date();

                await session.save();
            }

            return res.status(200).json({
                success: true,

                message:
                    "Virtual interview completed successfully",

                session,
            });
        } catch (error) {
            console.error(
                "Complete Virtual Interview Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to complete virtual interview",
            });
        }
    };

const deleteVirtualInterview =
    async (req, res) => {
        try {
            const { id } = req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid virtual interview session ID",
                });
            }

            const session =
                await VirtualInterviewSession
                    .findOneAndDelete({
                        _id: id,
                        user: req.user._id,
                    });

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Virtual interview session not found",
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Virtual interview history deleted successfully",
            });
        } catch (error) {
            console.error(
                "Delete Virtual Interview Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to delete virtual interview history",
            });
        }
    };

module.exports = {
    startVirtualInterview,
    submitVirtualAnswer,
    getVirtualInterview,
    getVirtualInterviewHistory,
    completeVirtualInterview,
    deleteVirtualInterview,
};