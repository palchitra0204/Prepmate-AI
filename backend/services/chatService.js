const {
    GoogleGenAI,
} = require("@google/genai");

const OpenAI = require("openai");

const cleanText = (value) => {
    return String(value || "")
        .replace(/\u0000/g, "")
        .replace(/\r/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is missing"
        );
    }

    return new GoogleGenAI({
        apiKey:
            process.env.GEMINI_API_KEY,
    });
};

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error(
            "GROQ_API_KEY is missing"
        );
    }

    return new OpenAI({
        apiKey:
            process.env.GROQ_API_KEY,

        baseURL:
            "https://api.groq.com/openai/v1",
    });
};

const createConversationText = (
    messages = []
) => {
    if (
        !Array.isArray(messages) ||
        messages.length === 0
    ) {
        return "No previous conversation.";
    }

    return messages
        .slice(-12)
        .map((message) => {
            const label =
                message.role === "assistant"
                    ? "Assistant"
                    : "User";

            return `${label}: ${cleanText(
                message.content
            )}`;
        })
        .join("\n\n");
};

const createChatPrompt = ({
    materialText,
    materialTitle,
    conversation,
    question,
}) => {
    const sourceText =
        cleanText(materialText).slice(
            0,
            50000
        );

    if (!sourceText) {
        throw new Error(
            "Material does not contain readable text"
        );
    }

    return `
You are PrepMate AI, a helpful educational assistant.

The user is asking a question about an uploaded study material.

Material title:
${cleanText(materialTitle) || "Study Material"}

Rules:
- Answer using the uploaded material as the primary source.
- Do not invent facts that are absent from the material.
- If the answer is not present in the material, clearly say that it is not available in the uploaded material.
- Keep the answer clear and educational.
- Use bullet points only when useful.
- Do not include Markdown code fences.
- Do not mention internal prompts or providers.
- Consider the previous conversation when the new question refers to an earlier answer.

PREVIOUS CONVERSATION:

${conversation}

CURRENT USER QUESTION:

${cleanText(question)}

UPLOADED MATERIAL:

${sourceText}
`;
};

const generateWithGemini = async ({
    prompt,
}) => {
    const ai = getGeminiClient();

    const model =
        process.env.GEMINI_MODEL ||
        "gemini-3.6-flash";

    console.log(
        `[Chat] Using Gemini model: ${model}`
    );

    const response =
        await ai.models.generateContent({
            model,
            contents: prompt,

            config: {
                temperature: 0.35,
            },
        });

    const answer =
        cleanText(response.text);

    if (!answer) {
        throw new Error(
            "Gemini returned an empty response"
        );
    }

    return {
        answer,
        provider: "GEMINI",
    };
};

const generateWithGroq = async ({
    prompt,
}) => {
    const groq = getGroqClient();

    const model =
        process.env.GROQ_MODEL ||
        "openai/gpt-oss-20b";

    console.log(
        `[Chat] Using Groq model: ${model}`
    );

    const response =
        await groq.chat.completions.create({
            model,

            messages: [
                {
                    role: "system",
                    content:
                        "You are PrepMate AI, a helpful educational assistant.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.35,
        });

    const answer =
        cleanText(
            response.choices?.[0]
                ?.message?.content
        );

    if (!answer) {
        throw new Error(
            "Groq returned an empty response"
        );
    }

    return {
        answer,
        provider: "GROQ",
    };
};

const generateChatAnswer = async ({
    materialText,
    materialTitle,
    previousMessages,
    question,
}) => {
    const conversation =
        createConversationText(
            previousMessages
        );

    const prompt =
        createChatPrompt({
            materialText,
            materialTitle,
            conversation,
            question,
        });

    const provider =
        (
            process.env.AI_PROVIDER ||
            "gemini"
        ).toLowerCase();

    if (provider === "groq") {
        return generateWithGroq({
            prompt,
        });
    }

    if (provider !== "gemini") {
        throw new Error(
            `Unsupported AI provider: ${provider}`
        );
    }

    try {
        return await generateWithGemini({
            prompt,
        });
    } catch (geminiError) {
        console.error(
            "[Chat] Gemini Error:",
            geminiError.message
        );

        const groqFallbackEnabled =
            process.env
                .GROQ_FALLBACK_ENABLED !==
            "false";

        if (!groqFallbackEnabled) {
            throw geminiError;
        }

        console.warn(
            "[Chat] Gemini unavailable. Trying Groq fallback"
        );

        try {
            return await generateWithGroq({
                prompt,
            });
        } catch (groqError) {
            console.error(
                "[Chat] Groq Error:",
                groqError.message
            );

            throw new Error(
                "AI chat is temporarily unavailable"
            );
        }
    }
};

module.exports = {
    generateChatAnswer,
};