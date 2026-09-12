const {
  runAgent,
} = require("./agentClient");

const generateQuestionAnswers =
  async ({
    materialText,
    analysis,
    difficulty,
    questionCount,
  }) => {
    const systemInstruction = `
You are the Question and Answer
Generation Agent of PrepMate AI.

Generate useful study questions
and accurate answers from the
uploaded material.

Rules:
1. Use only the supplied material.
2. Generate exactly the requested
   number of questions.
3. Match the requested difficulty.
4. Answers must be clear and useful.
5. Add explanations where helpful.
6. Avoid duplicate questions.
7. Do not invent information.
8. Return valid JSON only.

Required JSON structure:
{
  "questions": [
    {
      "question": "question text",
      "answer": "clear answer",
      "explanation":
        "additional explanation"
    }
  ]
}
    `.trim();

    const userPrompt = `
Difficulty: ${difficulty}
Required questions: ${questionCount}

Material analysis:
${JSON.stringify(analysis)}

Original material:
${materialText.slice(0, 30000)}
    `.trim();

    const result =
      await runAgent({
        agentName:
          "Question Answer Agent",

        systemInstruction,

        userPrompt,

        temperature: 0.35,
      });

    return result.questions || [];
  };

module.exports = {
  generateQuestionAnswers,
};