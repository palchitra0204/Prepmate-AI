const {
    GoogleGenAI,
} = require("@google/genai");

const OpenAI = require("openai");

const {
    generatePreparationContent,
} = require("./aiService");


const allowedVerdicts = [
    "Correct",
    "Partially Correct",
    "Incorrect",
];


/* =========================================================
   TEXT HELPERS
========================================================= */

const cleanText = (value) => {
    return String(value || "")
        .replace(/\u0000/g, "")
        .replace(/\r/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};


const removeMarkdownCodeBlock = (
    value
) => {
    return String(value || "")
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
};


const parseJsonObject = (
    responseText
) => {
    const cleanedResponse =
        removeMarkdownCodeBlock(
            responseText
        );

    if (!cleanedResponse) {
        throw new Error(
            "AI provider returned an empty response"
        );
    }

    let parsedResponse;

    try {
        parsedResponse =
            JSON.parse(cleanedResponse);
    } catch (error) {
        console.error(
            "Invalid Virtual Interview JSON:",
            responseText
        );

        throw new Error(
            "AI provider returned invalid interview data"
        );
    }

    if (
        !parsedResponse ||
        Array.isArray(parsedResponse) ||
        typeof parsedResponse !== "object"
    ) {
        throw new Error(
            "AI response must be a JSON object"
        );
    }

    return parsedResponse;
};


/* =========================================================
   AI CLIENTS
========================================================= */

const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is missing in the .env file"
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
            "GROQ_API_KEY is missing in the .env file"
        );
    }

    return new OpenAI({
        apiKey:
            process.env.GROQ_API_KEY,

        baseURL:
            "https://api.groq.com/openai/v1",
    });
};


/* =========================================================
   PROVIDER REQUESTS
========================================================= */

const generateGeminiJsonObject =
    async ({
        prompt,
        temperature,
    }) => {
        const ai =
            getGeminiClient();

        const model =
            process.env.GEMINI_MODEL ||
            "gemini-3.6-flash";

        console.log(
            `[Virtual Interview] Using Gemini model: ${model}`
        );

        const response =
            await ai.models.generateContent({
                model,

                contents: prompt,

                config: {
                    temperature,

                    responseMimeType:
                        "application/json",
                },
            });

        return parseJsonObject(
            response.text
        );
    };


const generateGroqJsonObject =
    async ({
        prompt,
        temperature,
    }) => {
        const groq =
            getGroqClient();

        const model =
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-20b";

        console.log(
            `[Virtual Interview] Using Groq model: ${model}`
        );

        const response =
            await groq.chat.completions.create({
                model,

                messages: [
                    {
                        role: "system",

                        content:
                            "You are PrepMate AI, a professional voice interviewer. Return only a valid JSON object without Markdown.",
                    },

                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                temperature,

                response_format: {
                    type: "json_object",
                },
            });

        const responseText =
            response.choices?.[0]
                ?.message?.content;

        return parseJsonObject(
            responseText
        );
    };


/* =========================================================
   GEMINI → GROQ FALLBACK
========================================================= */

const generateInterviewJson =
    async ({
        prompt,
        temperature = 0.4,
    }) => {
        const provider =
            (
                process.env.AI_PROVIDER ||
                "gemini"
            ).toLowerCase();

        /*
         * Groq can also be selected
         * as the primary provider.
         */

        if (provider === "groq") {
            return generateGroqJsonObject({
                prompt,
                temperature,
            });
        }

        if (provider !== "gemini") {
            throw new Error(
                `Unsupported AI provider: ${provider}`
            );
        }

        try {
            return await generateGeminiJsonObject({
                prompt,
                temperature,
            });
        } catch (geminiError) {
            console.error(
                "[Virtual Interview] Gemini Error:",
                geminiError.message
            );

            const groqFallbackEnabled =
                process.env
                    .GROQ_FALLBACK_ENABLED !==
                "false";

            if (!groqFallbackEnabled) {
                throw geminiError;
            }

            try {
                console.warn(
                    "[Virtual Interview] Gemini unavailable. Trying Groq fallback"
                );

                return await generateGroqJsonObject({
                    prompt,
                    temperature,
                });
            } catch (groqError) {
                console.error(
                    "[Virtual Interview] Groq Error:",
                    groqError.message
                );

                throw new Error(
                    "Virtual interview AI services are temporarily unavailable"
                );
            }
        }
    };


/* =========================================================
   INTERVIEW INSTRUCTIONS
========================================================= */

const getInterviewInstructions = (
    interviewType
) => {
    if (
        interviewType ===
        "RESUME_INTERVIEW"
    ) {
        return `
The uploaded file is a resume or CV.

Ask questions based on:
- Skills mentioned in the resume
- Projects
- Education
- Internship or work experience
- Technologies mentioned by the candidate

Do not invent skills or experience that are absent from the file.
Ask practical follow-up questions about the candidate's projects.
`;
    }

    if (
        interviewType ===
        "TECHNICAL_INTERVIEW"
    ) {
        return `
Conduct a technical interview using the uploaded file as the primary source.

Ask conceptual, implementation, debugging and practical questions.
Keep every question relevant to the technologies or topics present in the file.
`;
    }

    if (
        interviewType ===
        "GENERAL_INTERVIEW"
    ) {
        return `
Conduct a professional interview using the uploaded file for context.

Include questions that test communication, understanding, explanation and practical application.
Keep questions relevant to information present in the file.
`;
    }

    return `
Conduct an educational viva based strictly on the uploaded study material.

Ask questions that test whether the student understands the material.
Do not use information that is absent from the uploaded file.
`;
};


const getPreviousQuestionText = (
    questions = []
) => {
    if (
        !Array.isArray(questions) ||
        questions.length === 0
    ) {
        return "No previous questions.";
    }

    return questions
        .map(
            (item, index) =>
                `${index + 1}. ${cleanText(
                    item.question
                )}`
        )
        .join("\n");
};


/* =========================================================
   STATIC QUESTIONS
========================================================= */

const generateStaticQuestions =
    async ({
        materialText,
        difficulty,
        questionCount,
    }) => {
        /*
         * aiService already handles:
         * Gemini → Groq → Demo fallback
         */

        const generatedQuestions =
            await generatePreparationContent({
                text: materialText,

                mode:
                    "INTERVIEW",

                difficulty,
                questionCount,
            });

        if (
            !Array.isArray(
                generatedQuestions
            ) ||
            generatedQuestions.length === 0
        ) {
            throw new Error(
                "No static interview questions were generated"
            );
        }

        return generatedQuestions.map(
            (item, index) => ({
                questionNumber:
                    index + 1,

                question:
                    cleanText(
                        item.question
                    ),

                topic:
                    cleanText(
                        item.topic
                    ) ||
                    `Question ${index + 1}`,

                verdict:
                    "Pending",
            })
        );
    };


/* =========================================================
   FIRST DYNAMIC QUESTION
========================================================= */

const generateInitialDynamicQuestion =
    async ({
        materialText,
        interviewType,
        difficulty,
    }) => {
        const sourceText =
            cleanText(
                materialText
            ).slice(
                0,
                50000
            );

        if (!sourceText) {
            throw new Error(
                "Material text is required for virtual interview"
            );
        }

        const interviewInstructions =
            getInterviewInstructions(
                interviewType
            );

        const prompt = `
You are PrepMate AI, a professional voice interviewer.

${interviewInstructions}

Difficulty: ${difficulty}.

Generate only the first interview question.

Rules:
- Ask exactly one concise question.
- The question must be connected to the uploaded file.
- Do not reveal the answer.
- Do not include greetings.
- Use clear spoken English.
- Return only valid JSON.
- Do not include Markdown.
- Do not add text outside the JSON object.

Required JSON:

{
    "question": "Interview question",
    "topic": "Short topic name"
}

UPLOADED FILE CONTENT:

${sourceText}
`;

        const result =
            await generateInterviewJson({
                prompt,
                temperature: 0.65,
            });

        const question =
            cleanText(
                result.question
            );

        if (!question) {
            throw new Error(
                "AI provider did not generate an interview question"
            );
        }

        return {
            question,

            topic:
                cleanText(
                    result.topic
                ) ||
                "General",
        };
    };


/* =========================================================
   ANSWER EVALUATION
========================================================= */

const evaluateVirtualAnswer =
    async ({
        materialText,
        interviewType,
        difficulty,
        question,
        answerTranscript,
        previousQuestions,
        generateNextQuestion,
    }) => {
        const sourceText =
            cleanText(
                materialText
            ).slice(
                0,
                50000
            );

        const spokenAnswer =
            cleanText(
                answerTranscript
            );

        if (!sourceText) {
            throw new Error(
                "Material text is required"
            );
        }

        if (!cleanText(question)) {
            throw new Error(
                "Interview question is required"
            );
        }

        if (!spokenAnswer) {
            throw new Error(
                "Answer transcript is required"
            );
        }

        const interviewInstructions =
            getInterviewInstructions(
                interviewType
            );

        const previousQuestionText =
            getPreviousQuestionText(
                previousQuestions
            );

        const nextQuestionInstructions =
            generateNextQuestion
                ? `
Generate one adaptive next question.

Adaptation rules:
- Correct answer: ask a deeper or practical follow-up question.
- Partially correct answer: ask a related question about the missing concept.
- Incorrect answer: provide correction and ask a simpler related verification question.
- Do not repeat a previous question.
- Keep the question grounded in the uploaded file.
`
                : `
Do not generate another question.
Set "nextQuestion" to null.
`;

        const prompt = `
You are PrepMate AI, a fair and helpful voice interviewer.

${interviewInstructions}

Difficulty: ${difficulty}.

Evaluate the candidate's answer using the uploaded file as the source of truth.

CURRENT QUESTION:

${cleanText(question)}

CANDIDATE ANSWER:

${spokenAnswer}

QUESTIONS ALREADY USED:

${previousQuestionText}

${nextQuestionInstructions}

Evaluation rules:
- Score must be between 0 and 10.
- verdict must be exactly "Correct", "Partially Correct", or "Incorrect".
- Do not penalize minor speech-to-text grammar errors.
- feedback must be short and suitable for speaking aloud.
- If the answer is incorrect, explain what was wrong.
- idealAnswer must provide a correct and concise answer.
- Do not invent information outside the uploaded file.
- Return only valid JSON.
- Do not include Markdown.
- Do not add text outside the JSON object.

Required JSON:

{
    "verdict": "Correct",
    "score": 8,
    "feedback": "Short spoken feedback",
    "idealAnswer": "Correct concise answer",
    "strengths": [
        "One specific strength"
    ],
    "improvements": [
        "One specific improvement"
    ],
    "nextQuestion": {
        "question": "Next adaptive question",
        "topic": "Short topic name"
    }
}

When another question is not requested,
"nextQuestion" must be null.

UPLOADED FILE CONTENT:

${sourceText}
`;

        const result =
            await generateInterviewJson({
                prompt,
                temperature: 0.4,
            });

        const verdict =
            allowedVerdicts.includes(
                result.verdict
            )
                ? result.verdict
                : "Partially Correct";

        const numericScore =
            Number(
                result.score
            );

        const score =
            Number.isFinite(
                numericScore
            )
                ? Math.min(
                    10,
                    Math.max(
                        0,
                        Math.round(
                            numericScore * 10
                        ) / 10
                    )
                )
                : 0;

        let nextQuestion = null;

        if (
            generateNextQuestion &&
            result.nextQuestion &&
            cleanText(
                result.nextQuestion
                    .question
            )
        ) {
            nextQuestion = {
                question:
                    cleanText(
                        result
                            .nextQuestion
                            .question
                    ),

                topic:
                    cleanText(
                        result
                            .nextQuestion
                            .topic
                    ) ||
                    "General",
            };
        }

        if (
            generateNextQuestion &&
            !nextQuestion
        ) {
            throw new Error(
                "AI provider did not generate the next dynamic question"
            );
        }

        return {
            verdict,
            score,

            feedback:
                cleanText(
                    result.feedback
                ) ||
                "Your answer has been evaluated.",

            idealAnswer:
                cleanText(
                    result.idealAnswer
                ) ||
                "An ideal answer was not provided.",

            strengths:
                Array.isArray(
                    result.strengths
                )
                    ? result.strengths
                        .map(cleanText)
                        .filter(Boolean)
                        .slice(0, 5)
                    : [],

            improvements:
                Array.isArray(
                    result.improvements
                )
                    ? result.improvements
                        .map(cleanText)
                        .filter(Boolean)
                        .slice(0, 5)
                    : [],

            nextQuestion,
        };
    };


module.exports = {
    generateStaticQuestions,
    generateInitialDynamicQuestion,
    evaluateVirtualAnswer,
};