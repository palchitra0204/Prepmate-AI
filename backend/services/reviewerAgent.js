const {
    runAgent,
} = require("./agentClient");

const reviewGeneratedContent =
    async ({
        mode,
        difficulty,
        questionCount,
        analysis,
        generatedContent,
    }) => {
        const systemInstruction = `
You are the Quality Review Agent
of PrepMate AI.

Your responsibility is to review
AI-generated preparation content.

Review rules:
1. Ensure all questions are based
   on the supplied material analysis.
2. Remove duplicate questions.
3. Correct inaccurate answers.
4. Match the requested difficulty.
5. Keep exactly the requested
   number of questions.
6. Preserve the correct structure
   for the selected mode.
7. Do not add unsupported facts.
8. Return valid JSON only.

For MCQ mode, every item requires:
- question
- four options
- correctAnswer
- explanation

For QUESTION_ANSWER mode:
- question
- answer
- explanation

For INTERVIEW mode:
- question
- answer
- tip

Required JSON structure:
{
  "approved": true,
  "issuesFixed": [
    "description of correction"
  ],
  "questions": []
}
    `.trim();

        const userPrompt = `
Selected mode: ${mode}
Difficulty: ${difficulty}
Required questions: ${questionCount}

Material analysis:
${JSON.stringify(analysis)}

Generated content:
${JSON.stringify(generatedContent)}
    `.trim();

        const result =
            await runAgent({
                agentName:
                    "Quality Review Agent",

                systemInstruction,

                userPrompt,

                temperature: 0.2,
            });

        return {
            approved:
                result.approved !== false,

            issuesFixed:
                result.issuesFixed || [],

            questions:
                result.questions || [],
        };
    };

module.exports = {
    reviewGeneratedContent,
};