const {
  runAgent,
} = require("./agentClient");

const analyzeMaterial = async ({
  materialText,
}) => {
  if (
    !materialText ||
    !materialText.trim()
  ) {
    throw new Error(
      "Material text is required for analysis"
    );
  }

  const limitedMaterial =
    materialText.slice(0, 30000);

  const systemInstruction = `
You are the Content Analyzer Agent
of PrepMate AI.

Your responsibility is to analyze
the uploaded study material.

Rules:
1. Use only the supplied material.
2. Do not add external facts.
3. Identify the main topic.
4. Extract important concepts.
5. Identify definitions and key facts.
6. Create a short accurate summary.
7. Return valid JSON only.

Required JSON structure:
{
  "title": "main topic",
  "summary": "short summary",
  "topics": [
    "topic 1",
    "topic 2"
  ],
  "keyConcepts": [
    {
      "concept": "concept name",
      "description": "short description"
    }
  ],
  "importantFacts": [
    "fact 1",
    "fact 2"
  ]
}
  `.trim();

  const userPrompt = `
Analyze the following uploaded
study material:

${limitedMaterial}
  `.trim();

  return runAgent({
    agentName:
      "Content Analyzer Agent",

    systemInstruction,

    userPrompt,

    temperature: 0.2,
  });
};

module.exports = {
  analyzeMaterial,
};