const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");

const User = require("../models/User");
const Material = require(
    "../models/Material"
);
const Preparation = require(
    "../models/Preparation"
);
const VirtualInterviewSession = require(
    "../models/VirtualInterviewSession"
);


/* =========================================================
   DELETE PHYSICAL MATERIAL FILE
========================================================= */

const deleteStoredMaterialFile =
    async (filePath) => {
        if (!filePath) {
            return false;
        }

        try {
            const backendDirectory =
                path.resolve(
                    __dirname,
                    ".."
                );

            const uploadsDirectory =
                path.resolve(
                    backendDirectory,
                    "uploads"
                );

            const storedPath =
                String(filePath);

            const absoluteFilePath =
                path.isAbsolute(storedPath)
                    ? path.resolve(storedPath)
                    : path.resolve(
                        backendDirectory,

                        storedPath.replace(
                            /^[/\\]+/,
                            ""
                        )
                    );

            const relativePath =
                path.relative(
                    uploadsDirectory,
                    absoluteFilePath
                );

            const isInsideUploads =
                relativePath !== "" &&
                !relativePath.startsWith(
                    ".."
                ) &&
                !path.isAbsolute(
                    relativePath
                );

            if (!isInsideUploads) {
                console.warn(
                    "File deletion skipped because path is outside uploads:",
                    absoluteFilePath
                );

                return false;
            }

            await fs.unlink(
                absoluteFilePath
            );

            return true;
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error(
                    "Delete Stored Material File Error:",
                    error.message
                );
            }

            return false;
        }
    };


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

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
            totalVirtualInterviews,
            activeVirtualInterviews,
            completedVirtualInterviews,
            failedVirtualInterviews,
            staticVirtualInterviews,
            dynamicVirtualInterviews,
            recentUsers,
            recentMaterials,
            recentPreparations,
            recentVirtualInterviews,
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

            VirtualInterviewSession
                .countDocuments(),

            VirtualInterviewSession
                .countDocuments({
                    status: "Active",
                }),

            VirtualInterviewSession
                .countDocuments({
                    status: "Completed",
                }),

            VirtualInterviewSession
                .countDocuments({
                    status: "Failed",
                }),

            VirtualInterviewSession
                .countDocuments({
                    questionStyle:
                        "STATIC",
                }),

            VirtualInterviewSession
                .countDocuments({
                    questionStyle:
                        "DYNAMIC",
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

            VirtualInterviewSession
                .find()
                .select(
                    "interviewType questionStyle difficulty questionCount status averageScore percentage user material createdAt"
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

        const totalGenerations =
            totalPreparations +
            totalVirtualInterviews;

        const allCompleted =
            totalCompleted +
            completedVirtualInterviews;

        const allFailed =
            totalFailed +
            failedVirtualInterviews;

        const multiAgentRate =
            totalPreparations > 0
                ? Math.round(
                    (totalMultiAgent /
                        totalPreparations) *
                    100
                )
                : 0;

        const completionRate =
            totalGenerations > 0
                ? Math.round(
                    (allCompleted /
                        totalGenerations) *
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
                totalGenerations,
                totalMCQs,
                totalQuestionAnswers,
                totalInterviews,
                totalVirtualInterviews,
                activeVirtualInterviews,
                completedVirtualInterviews,
                failedVirtualInterviews,
                staticVirtualInterviews,
                dynamicVirtualInterviews,
                totalMultiAgent,
                totalFallback,

                totalCompleted:
                    allCompleted,

                totalFailed:
                    allFailed,

                multiAgentRate,
                completionRate,
            },

            aiSystem: {
                provider:
                    process.env
                        .AI_PROVIDER ||
                    "Gemini",

                model:
                    process.env
                        .GEMINI_MODEL ||
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
            recentVirtualInterviews,
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


/* =========================================================
   GET ALL USERS
========================================================= */

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


/* =========================================================
   DELETE USER
========================================================= */

const deleteUser = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId
                .isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user ID",
            });
        }

        if (
            String(req.user._id) ===
            String(id)
        ) {
            return res.status(403).json({
                success: false,

                message:
                    "You cannot delete your own administrator account",
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        /*
         * Admin account fixed and protected.
         */

        if (user.role === "Admin") {
            return res.status(403).json({
                success: false,

                message:
                    "Administrator account cannot be deleted",
            });
        }

        /*
         * Physical files delete karne ke
         * liye materials pehle load karo.
         */

        const userMaterials =
            await Material.find({
                user: user._id,
            })
                .select("filePath")
                .lean();

        const [
            preparationResult,
            interviewResult,
            materialResult,
        ] = await Promise.all([
            Preparation.deleteMany({
                user: user._id,
            }),

            VirtualInterviewSession
                .deleteMany({
                    user: user._id,
                }),

            Material.deleteMany({
                user: user._id,
            }),
        ]);

        await User.deleteOne({
            _id: user._id,
        });

        const fileDeletionResults =
            await Promise.all(
                userMaterials.map(
                    (material) =>
                        deleteStoredMaterialFile(
                            material.filePath
                        )
                )
            );

        const deletedFiles =
            fileDeletionResults.filter(
                Boolean
            ).length;

        return res.status(200).json({
            success: true,

            message:
                "User and associated records deleted successfully",

            deletedUserId:
                user._id,

            deletedRecords: {
                materials:
                    materialResult
                        .deletedCount ||
                    0,

                preparations:
                    preparationResult
                        .deletedCount ||
                    0,

                virtualInterviews:
                    interviewResult
                        .deletedCount ||
                    0,

                physicalFiles:
                    deletedFiles,
            },
        });
    } catch (error) {
        console.error(
            "Delete Admin User Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Unable to delete user",
        });
    }
};


/* =========================================================
   GET ALL MATERIALS
========================================================= */

const getAllMaterials = async (
    req,
    res
) => {
    try {
        const materials =
            await Material.find()
                .select("-extractedText")
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


/* =========================================================
   DELETE MATERIAL
========================================================= */

const deleteAdminMaterial = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId
                .isValid(id)
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Invalid material ID",
            });
        }

        const material =
            await Material.findById(id);

        if (!material) {
            return res.status(404).json({
                success: false,

                message:
                    "Material not found",
            });
        }

        const [
            preparationResult,
            interviewResult,
        ] = await Promise.all([
            Preparation.deleteMany({
                material:
                    material._id,
            }),

            VirtualInterviewSession
                .deleteMany({
                    material:
                        material._id,
                }),
        ]);

        await Material.deleteOne({
            _id: material._id,
        });

        const physicalFileDeleted =
            await deleteStoredMaterialFile(
                material.filePath
            );

        return res.status(200).json({
            success: true,

            message:
                "Material and associated records deleted successfully",

            deletedMaterialId:
                material._id,

            deletedRecords: {
                preparations:
                    preparationResult
                        .deletedCount ||
                    0,

                virtualInterviews:
                    interviewResult
                        .deletedCount ||
                    0,

                physicalFileDeleted,
            },
        });
    } catch (error) {
        console.error(
            "Delete Admin Material Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Unable to delete material",
        });
    }
};


/* =========================================================
   GET ALL PREPARATIONS
========================================================= */

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


/* =========================================================
   GET ALL GENERATIONS
========================================================= */

const getAllGenerations =
    async (req, res) => {
        try {
            const [
                preparations,
                virtualInterviews,
            ] = await Promise.all([
                Preparation.find()
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
                    })
                    .lean(),

                VirtualInterviewSession
                    .find()
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
                    })
                    .lean(),
            ]);

            const normalGenerations =
                preparations.map(
                    (item) => ({
                        ...item,

                        generationType:
                            "PREPARATION",
                    })
                );

            const interviewGenerations =
                virtualInterviews.map(
                    (item) => ({
                        ...item,

                        generationType:
                            "VIRTUAL_INTERVIEW",

                        mode:
                            "VIRTUAL_INTERVIEW",

                        content:
                            item.questions ||
                            [],

                        generationSystem:
                            "VOICE_AI",

                        agentTrace: [],
                    })
                );

            const generations = [
                ...normalGenerations,
                ...interviewGenerations,
            ].sort(
                (first, second) =>
                    new Date(
                        second.createdAt
                    ) -
                    new Date(
                        first.createdAt
                    )
            );

            return res.status(200).json({
                success: true,

                count:
                    generations.length,

                generations,
            });
        } catch (error) {
            console.error(
                "Get Admin Generations Error:",
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    error.message ||
                    "Unable to load AI generations",
            });
        }
    };

/* =========================================================
DELETE GENERATION
========================================================= */

const deleteAdminGeneration = async (
    req,
    res
) => {
    try {
        const {
            generationType,
            id,
        } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid generation ID",
            });
        }

        const normalizedType =
            String(generationType)
                .trim()
                .toUpperCase();

        let deletedGeneration = null;

        if (
            normalizedType ===
            "PREPARATION"
        ) {
            deletedGeneration =
                await Preparation.findByIdAndDelete(
                    id
                );
        } else if (
            normalizedType ===
            "VIRTUAL_INTERVIEW"
        ) {
            deletedGeneration =
                await VirtualInterviewSession
                    .findByIdAndDelete(id);
        } else {
            return res.status(400).json({
                success: false,

                message:
                    "Invalid generation type",
            });
        }

        if (!deletedGeneration) {
            return res.status(404).json({
                success: false,

                message:
                    "Generation not found",
            });
        }

        return res.status(200).json({
            success: true,

            message:
                "Generation deleted successfully",

            deletedGenerationId:
                deletedGeneration._id,

            generationType:
                normalizedType,
        });
    } catch (error) {
        console.error(
            "Delete Admin Generation Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Unable to delete generation",
        });
    }
};

module.exports = {
    getAdminDashboard,
    getAllUsers,
    deleteUser,
    getAllMaterials,
    deleteAdminMaterial,
    getAllPreparations,
    getAllGenerations,
    deleteAdminGeneration,
};