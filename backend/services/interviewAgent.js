const {
  runAgent,
} = require("./agentClient");

const generateInterviewQuestions =
  async ({
    materialText,
    analysis,
    difficulty,
    questionCount,
  }) => {
    const systemInstruction = `
You are the Interview and Viva
Preparation Agent of PrepMate AI.

Generate interview or viva questions
from the uploaded study material.

Rules:
1. Use only the supplied material.
2. Generate exactly the requested
   number of questions.
3. Match the requested difficulty.
4. Include a strong model answer.
5. Include a short interviewer tip.
6. Avoid repeated questions.
7. Do not use external information.
8. Return valid JSON only.

Required JSON structure:
{
  "questions": [
    {
      "question":
        "interview question",
      "answer":
        "recommended answer",
      "tip":
        "important point to mention"
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
          "Interview Agent",

        systemInstruction,

        userPrompt,

        temperature: 0.4,
      });

    return result.questions || [];
  };

module.exports = {
  generateInterviewQuestions,
};