const {
  analyzeMaterial,
} = require("./analyzerAgent");

const {
  generateMCQs,
} = require("./mcqAgent");

const {
  generateQuestionAnswers,
} = require(
  "./questionAnswerAgent"
);

const {
  generateInterviewQuestions,
} = require("./interviewAgent");

const {
  reviewGeneratedContent,
} = require("./reviewerAgent");

const {
  formatFinalContent,
} = require("./formatterAgent");

const SUPPORTED_MODES = [
  "MCQ",
  "QUESTION_ANSWER",
  "INTERVIEW",
];

const runCoordinatorAgent =
  async ({
    materialText,
    mode,
    difficulty = "Medium",
    questionCount = 10,
  }) => {
    if (
      !materialText ||
      !materialText.trim()
    ) {
      throw new Error(
        "Material text is required"
      );
    }

    if (
      !SUPPORTED_MODES.includes(mode)
    ) {
      throw new Error(
        `Unsupported preparation mode: ${mode}`
      );
    }

    const normalizedCount =
      Math.min(
        Math.max(
          Number(questionCount) || 10,
          1
        ),
        20
      );

    console.log(
      "[Coordinator] Multi-agent workflow started"
    );

    /*
     * Agent 1:
     * Uploaded material analysis
     */
    const analysis =
      await analyzeMaterial({
        materialText,
      });

    console.log(
      "[Coordinator] Material analysis completed"
    );

    /*
     * Agent 2:
     * Selected content generation
     */
    let generatedContent = [];

    if (mode === "MCQ") {
      generatedContent =
        await generateMCQs({
          materialText,
          analysis,
          difficulty,
          questionCount:
            normalizedCount,
        });
    }

    if (
      mode === "QUESTION_ANSWER"
    ) {
      generatedContent =
        await generateQuestionAnswers({
          materialText,
          analysis,
          difficulty,
          questionCount:
            normalizedCount,
        });
    }

    if (mode === "INTERVIEW") {
      generatedContent =
        await generateInterviewQuestions({
          materialText,
          analysis,
          difficulty,
          questionCount:
            normalizedCount,
        });
    }

    if (
      !Array.isArray(
        generatedContent
      ) ||
      generatedContent.length === 0
    ) {
      throw new Error(
        "Generation Agent returned no questions"
      );
    }

    console.log(
      "[Coordinator] Content generation completed"
    );

    /*
     * Agent 3:
     * Generated content review
     */
    const review =
      await reviewGeneratedContent({
        mode,
        difficulty,
        questionCount:
          normalizedCount,
        analysis,
        generatedContent,
      });

    if (
      !review.questions.length
    ) {
      throw new Error(
        "Reviewer Agent returned no approved questions"
      );
    }

    console.log(
      "[Coordinator] Quality review completed"
    );

    /*
     * Agent 4:
     * Frontend JSON formatting
     */
    const finalContent =
      await formatFinalContent({
        mode,
        questionCount:
          normalizedCount,
        reviewedQuestions:
          review.questions,
      });

    if (!finalContent.length) {
      throw new Error(
        "Formatter Agent returned no content"
      );
    }

    console.log(
      "[Coordinator] Multi-agent workflow completed"
    );

    return {
      content: finalContent,

      analysis,

      review: {
        approved:
          review.approved,

        issuesFixed:
          review.issuesFixed,
      },

      agentTrace: [
        {
          agent:
            "Content Analyzer Agent",
          status: "completed",
        },
        {
          agent:
            mode === "MCQ"
              ? "MCQ Generation Agent"
              : mode ===
                  "QUESTION_ANSWER"
                ? "Question Answer Agent"
                : "Interview Agent",
          status: "completed",
        },
        {
          agent:
            "Quality Review Agent",
          status: "completed",
        },
        {
          agent:
            "Output Formatting Agent",
          status: "completed",
        },
      ],
    };
  };

module.exports = {
  runCoordinatorAgent,
};