const {
    GoogleGenAI,
} = require("@google/genai");

const cleanJsonResponse = (
    responseText
) => {
    if (!responseText) {
        throw new Error(
            "AI returned an empty response"
        );
    }

    const cleanedText = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error(
            "Invalid AI JSON:",
            cleanedText
        );

        throw new Error(
            "AI returned invalid JSON"
        );
    }
};

const runAgent = async ({
    agentName,
    systemInstruction,
    userPrompt,
    temperature = 0.3,
}) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is missing in the .env file"
        );
    }

    if (!process.env.GEMINI_MODEL) {
        throw new Error(
            "GEMINI_MODEL is missing in the .env file"
        );
    }

    try {
        const ai = new GoogleGenAI({
            apiKey:
                process.env.GEMINI_API_KEY,
        });

        console.log(
            `[Multi-Agent] Running ${agentName}`
        );

        const response =
            await ai.models.generateContent({
                model:
                    process.env.GEMINI_MODEL,

                contents: [
                    {
                        role: "user",

                        parts: [
                            {
                                text: `
SYSTEM INSTRUCTIONS:
${systemInstruction}

USER REQUEST:
${userPrompt}
                `.trim(),
                            },
                        ],
                    },
                ],

                config: {
                    temperature,
                    responseMimeType:
                        "application/json",
                },
            });

        const responseText =
            response.text;

        const parsedResult =
            cleanJsonResponse(
                responseText
            );

        console.log(
            `[Multi-Agent] ${agentName} completed`
        );

        return parsedResult;
    } catch (error) {
        console.error(
            `[Multi-Agent] ${agentName} failed:`,
            error.message
        );

        throw error;
    }
};

module.exports = {
    runAgent,
};