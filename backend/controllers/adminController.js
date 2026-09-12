const User = require(
    "../models/User"
);

const Material = require(
    "../models/Material"
);

const Preparation = require(
    "../models/Preparation"
);

const getAdminDashboard = async (
    req,
    res
) => {
    try {
        const [
            totalUsers,
            totalStudents,
            totalAdmins,
            totalMaterials,
            totalPreparations,
            totalMCQs,
            totalQuestionAnswers,
            totalInterviews,
            totalMultiAgent,
            totalFallback,
            totalCompleted,
            totalFailed,
            recentUsers,
            recentMaterials,
            recentPreparations,
        ] = await Promise.all([
            User.countDocuments(),

            User.countDocuments({
                role: "Student",
            }),

            User.countDocuments({
                role: "Admin",
            }),

            Material.countDocuments(),

            Preparation.countDocuments(),

            Preparation.countDocuments({
                mode: "MCQ",
            }),

            Preparation.countDocuments({
                mode:
                    "QUESTION_ANSWER",
            }),

            Preparation.countDocuments({
                mode: "INTERVIEW",
            }),

            Preparation.countDocuments({
                generationSystem:
                    "MULTI_AGENT",
            }),

            Preparation.countDocuments({
                generationSystem:
                    "SINGLE_AGENT_FALLBACK",
            }),

            Preparation.countDocuments({
                status: "Completed",
            }),

            Preparation.countDocuments({
                status: "Failed",
            }),

            User.find()
                .select(
                    "name email role createdAt"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),

            Material.find()
                .select(
                    "title originalFileName fileType fileSize status user createdAt"
                )
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),

            Preparation.find()
                .select(
                    "mode difficulty questionCount generationSystem provider status agentTrace user material createdAt"
                )
                .populate(
                    "user",
                    "name email"
                )
                .populate(
                    "material",
                    "title originalFileName"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),
        ]);

        const multiAgentRate =
            totalPreparations > 0
                ? Math.round(
                    (totalMultiAgent /
                        totalPreparations) *
                    100
                )
                : 0;

        const completionRate =
            totalPreparations > 0
                ? Math.round(
                    (totalCompleted /
                        totalPreparations) *
                    100
                )
                : 0;

        return res.status(200).json({
            success: true,

            message:
                "Admin dashboard loaded successfully",

            statistics: {
                totalUsers,
                totalStudents,
                totalAdmins,
                totalMaterials,
                totalPreparations,
                totalMCQs,
                totalQuestionAnswers,
                totalInterviews,
                totalMultiAgent,
                totalFallback,
                totalCompleted,
                totalFailed,
                multiAgentRate,
                completionRate,
            },

            aiSystem: {
                provider:
                    process.env.AI_PROVIDER ||
                    "Gemini",

                model:
                    process.env.GEMINI_MODEL ||
                    "Not configured",

                multiAgentEnabled: true,

                fallbackEnabled:
                    process.env
                        .MULTI_AGENT_FALLBACK !==
                    "false",

                agents: [
                    "Content Analyzer Agent",
                    "MCQ Generation Agent",
                    "Question Answer Agent",
                    "Interview Agent",
                    "Quality Review Agent",
                    "Output Formatting Agent",
                ],
            },

            recentUsers,
            recentMaterials,
            recentPreparations,
        });
    } catch (error) {
        console.error(
            "Admin Dashboard Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Unable to load admin dashboard",
        });
    }
};

const getAllUsers = async (
    req,
    res
) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error(
            "Get Admin Users Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load users",
        });
    }
};

const getAllMaterials = async (
    req,
    res
) => {
    try {
        const materials =
            await Material.find()
                .select(
                    "-extractedText"
                )
                .populate(
                    "user",
                    "name email role"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            count: materials.length,
            materials,
        });
    } catch (error) {
        console.error(
            "Get Admin Materials Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load materials",
        });
    }
};

const getAllPreparations =
    async (req, res) => {
        try {
            const preparations =
                await Preparation.find()
                    .populate(
                        "user",
                        "name email role"
                    )
                    .populate(
                        "material",
                        "title originalFileName fileType"
                    )
                    .sort({
                        createdAt: -1,
                    });

            return res.status(200).json({
                success: true,
                count:
                    preparations.length,
                preparations,
            });
        } catch (error) {
            console.error(
                "Get Admin Preparations Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to load preparations",
            });
        }
    };

module.exports = {
    getAdminDashboard,
    getAllUsers,
    getAllMaterials,
    getAllPreparations,
};