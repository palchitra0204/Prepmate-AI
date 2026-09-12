const {
  runCoordinatorAgent,
} = require("./coordinatorAgent");

const generateWithMultipleAgents =
  async ({
    materialText,
    mode,
    difficulty,
    questionCount,
  }) => {
    try {
      const result =
        await runCoordinatorAgent({
          materialText,
          mode,
          difficulty,
          questionCount,
        });

      return {
        success: true,

        provider: "Gemini",

        systemType:
          "MULTI_AGENT",

        content: result.content,

        analysis:
          result.analysis,

        review: result.review,

        agentTrace:
          result.agentTrace,
      };
    } catch (error) {
      console.error(
        "Multi-Agent Service Error:",
        error.message
      );

      throw error;
    }
  };

module.exports = {
  generateWithMultipleAgents,
};