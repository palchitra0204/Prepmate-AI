const {
  runAgent,
} = require("./agentClient");

const formatFinalContent = async ({
  mode,
  questionCount,
  reviewedQuestions,
}) => {
  const systemInstruction = `
You are the Output Formatting Agent
of PrepMate AI.

Convert reviewed questions into the
exact JSON structure required by the
frontend.

Rules:
1. Do not change the meaning.
2. Do not introduce new information.
3. Return exactly the requested
   number of questions.
4. Ensure every required property
   exists.
5. Return valid JSON only.

MCQ item structure:
{
  "question": "text",
  "options": [
    "option 1",
    "option 2",
    "option 3",
    "option 4"
  ],
  "correctAnswer": "correct option",
  "explanation": "explanation"
}

QUESTION_ANSWER item structure:
{
  "question": "text",
  "answer": "answer",
  "explanation": "explanation"
}

INTERVIEW item structure:
{
  "question": "text",
  "answer": "answer",
  "tip": "interviewer tip"
}

Required final JSON:
{
  "content": []
}
  `.trim();

  const userPrompt = `
Mode: ${mode}
Required count: ${questionCount}

Reviewed questions:
${JSON.stringify(reviewedQuestions)}
  `.trim();

  const result = await runAgent({
    agentName:
      "Output Formatting Agent",

    systemInstruction,

    userPrompt,

    temperature: 0.1,
  });

  return Array.isArray(
    result.content
  )
    ? result.content
    : [];
};

module.exports = {
  formatFinalContent,
};