const {
  runAgent,
} = require("./agentClient");

const generateMCQs = async ({
  materialText,
  analysis,
  difficulty,
  questionCount,
}) => {
  const systemInstruction = `
You are the MCQ Generation Agent
of PrepMate AI.

Generate multiple-choice questions
from the supplied study material
and its analysis.

Rules:
1. Use only the supplied material.
2. Generate exactly the requested
   number of questions.
3. Every question must have exactly
   four options.
4. Only one option must be correct.
5. correctAnswer must contain the
   complete correct option text.
6. Add a short explanation.
7. Avoid duplicate questions.
8. Match the requested difficulty.
9. Return valid JSON only.

Required JSON structure:
{
  "questions": [
    {
      "question": "question text",
      "options": [
        "option one",
        "option two",
        "option three",
        "option four"
      ],
      "correctAnswer":
        "complete correct option",
      "explanation":
        "short explanation"
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

  const result = await runAgent({
    agentName:
      "MCQ Generation Agent",

    systemInstruction,

    userPrompt,

    temperature: 0.4,
  });

  return result.questions || [];
};

module.exports = {
  generateMCQs,
};