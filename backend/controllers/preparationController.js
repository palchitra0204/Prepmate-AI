const mongoose = require("mongoose");

const Material = require(
  "../models/Material"
);

const Preparation = require(
  "../models/Preparation"
);

const {
  generateWithMultipleAgents,
} = require(
  "../services/multiAgentService"
);

const {
  generatePreparationContent,
} = require(
  "../services/aiService"
);

const allowedModes = [
  "MCQ",
  "QUESTION_ANSWER",
  "INTERVIEW",
];

const allowedDifficulties = [
  "Easy",
  "Medium",
  "Hard",
];

const generatePreparation = async (
  req,
  res
) => {
  let preparation = null;

  try {
    const {
      materialId,
      mode,
      difficulty = "Medium",
      questionCount = 10,
    } = req.body;

    if (!materialId || !mode) {
      return res.status(400).json({
        success: false,
        message:
          "Material ID and preparation mode are required",
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
      !allowedModes.includes(mode)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Mode must be MCQ, QUESTION_ANSWER or INTERVIEW",
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
          "Material is not ready for preparation",
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

    preparation =
      await Preparation.create({
        user: req.user._id,
        material: material._id,
        mode,
        difficulty,
        questionCount:
          totalQuestions,
        status: "Generating",
        generationSystem:
          "MULTI_AGENT",
        provider: "Gemini",
      });

    let generationResult;

    try {
      /*
       * Primary Multi-Agent workflow
       */
      generationResult =
        await generateWithMultipleAgents({
          materialText:
            material.extractedText,

          mode,

          difficulty,

          questionCount:
            totalQuestions,
        });
    } catch (multiAgentError) {
      console.error(
        "Multi-Agent Generation Error:",
        multiAgentError.message
      );

      /*
       * Optional existing AI fallback.
       *
       * .env mein:
       * MULTI_AGENT_FALLBACK=true
       */
      const fallbackEnabled =
        process.env
          .MULTI_AGENT_FALLBACK !==
        "false";

      if (!fallbackEnabled) {
        throw multiAgentError;
      }

      console.log(
        "Multi-Agent unavailable. Using existing AI fallback."
      );

      const fallbackContent =
        await generatePreparationContent({
          text:
            material.extractedText,
          mode,
          difficulty,
          questionCount:
            totalQuestions,
        });

      generationResult = {
        success: true,
        provider:
          process.env.AI_PROVIDER ||
          "Gemini",
        systemType:
          "SINGLE_AGENT_FALLBACK",
        content: fallbackContent,
        analysis: null,
        review: null,
        agentTrace: [
          {
            agent:
              "Existing AI Fallback",
            status: "completed",
          },
        ],
      };
    }

    if (
      !Array.isArray(
        generationResult.content
      ) ||
      generationResult.content
        .length === 0
    ) {
      throw new Error(
        "No preparation content was generated"
      );
    }

    preparation.content =
      generationResult.content;

    preparation.generationSystem =
      generationResult.systemType ||
      "MULTI_AGENT";

    preparation.provider =
      generationResult.provider ||
      "Gemini";

    preparation.materialAnalysis =
      generationResult.analysis ||
      null;

    preparation.qualityReview =
      generationResult.review ||
      null;

    preparation.agentTrace =
      generationResult.agentTrace ||
      [];

    preparation.status =
      "Completed";

    preparation.errorMessage = "";

    preparation.completedAt =
      new Date();

    await preparation.save();

    return res.status(201).json({
      success: true,

      message:
        preparation.generationSystem ===
        "MULTI_AGENT"
          ? "Preparation generated successfully using multiple AI agents"
          : "Preparation generated successfully using fallback AI",

      systemType:
        preparation.generationSystem,

      agentTrace:
        preparation.agentTrace,

      preparation,
    });
  } catch (error) {
    console.error(
      "Generate Preparation Error:",
      error
    );

    if (preparation) {
      try {
        preparation.status =
          "Failed";

        preparation.errorMessage =
          error.message ||
          "Content generation failed";

        await preparation.save();
      } catch (saveError) {
        console.error(
          "Unable to save failed preparation:",
          saveError.message
        );
      }
    }

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to generate preparation",
    });
  }
};

const getPreparationHistory =
  async (req, res) => {
    try {
      const preparations =
        await Preparation.find({
          user: req.user._id,
        })
          .populate(
            "material",
            "title originalFileName fileType status"
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
        "Preparation History Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load preparation history",
      });
    }
  };

const getPreparationById =
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
            "Invalid preparation ID",
        });
      }

      const preparation =
        await Preparation.findOne({
          _id: req.params.id,
          user: req.user._id,
        }).populate(
          "material",
          "title originalFileName fileType status"
        );

      if (!preparation) {
        return res.status(404).json({
          success: false,
          message:
            "Preparation result not found",
        });
      }

      return res.status(200).json({
        success: true,
        preparation,
      });
    } catch (error) {
      console.error(
        "Get Preparation Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load preparation result",
      });
    }
  };

const deletePreparation =
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
            "Invalid preparation ID",
        });
      }

      const preparation =
        await Preparation
          .findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
          });

      if (!preparation) {
        return res.status(404).json({
          success: false,
          message:
            "Preparation result not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Preparation deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Preparation Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete preparation",
      });
    }
  };

module.exports = {
  generatePreparation,
  getPreparationHistory,
  getPreparationById,
  deletePreparation,
};