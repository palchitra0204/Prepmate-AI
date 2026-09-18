const {
    GoogleGenAI,
} = require("@google/genai");

const {
    generatePreparationContent,
} = require("./aiService");

const allowedVerdicts = [
    "Correct",
    "Partially Correct",
    "Incorrect",
];

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
            "Gemini returned an empty response"
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
            "Gemini returned invalid interview data"
        );
    }

    if (
        !parsedResponse ||
        Array.isArray(parsedResponse) ||
        typeof parsedResponse !== "object"
    ) {
        throw new Error(
            "Gemini response must be a JSON object"
        );
    }

    return parsedResponse;
};

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

/*
 * STATIC QUESTIONS
 *
 * All questions are generated together
 * before the interview begins.
 */
const generateStaticQuestions =
    async ({
        materialText,
        difficulty,
        questionCount,
    }) => {
        const generatedQuestions =
            await generatePreparationContent({
                text: materialText,
                mode: "INTERVIEW",
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
                    cleanText(item.topic) ||
                    `Question ${index + 1}`,

                verdict: "Pending",
            })
        );
    };

/*
 * FIRST DYNAMIC QUESTION
 */
const generateInitialDynamicQuestion =
    async ({
        materialText,
        interviewType,
        difficulty,
    }) => {
        const sourceText = cleanText(
            materialText
        ).slice(0, 50000);

        if (!sourceText) {
            throw new Error(
                "Material text is required for virtual interview"
            );
        }

        const ai = getGeminiClient();

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

Required JSON:

{
  "question": "Interview question",
  "topic": "Short topic name"
}

UPLOADED FILE CONTENT:

${sourceText}
`;

        const response =
            await ai.models.generateContent({
                model:
                    process.env.GEMINI_MODEL ||
                    "gemini-2.5-flash",

                contents: prompt,

                config: {
                    temperature: 0.65,

                    responseMimeType:
                        "application/json",
                },
            });

        const result =
            parseJsonObject(
                response.text
            );

        const question = cleanText(
            result.question
        );

        if (!question) {
            throw new Error(
                "Gemini did not generate an interview question"
            );
        }

        return {
            question,
            topic:
                cleanText(result.topic) ||
                "General",
        };
    };

/*
 * ANSWER EVALUATION
 *
 * generateNextQuestion:
 * true only for DYNAMIC mode when
 * another question is required.
 */
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
        const sourceText = cleanText(
            materialText
        ).slice(0, 50000);

        const spokenAnswer = cleanText(
            answerTranscript
        );

        if (!sourceText) {
            throw new Error(
                "Material text is required"
            );
        }

        if (!spokenAnswer) {
            throw new Error(
                "Answer transcript is required"
            );
        }

        const ai = getGeminiClient();

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
- verdict must be exactly:
  "Correct",
  "Partially Correct",
  or "Incorrect".
- Do not penalize minor speech-to-text grammar errors.
- feedback must be short and suitable for speaking aloud.
- If the answer is incorrect, explain what was wrong.
- idealAnswer must provide a correct and concise answer.
- Do not invent information outside the uploaded file.
- Return only valid JSON.
- Do not include Markdown.

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

        const response =
            await ai.models.generateContent({
                model:
                    process.env.GEMINI_MODEL ||
                    "gemini-2.5-flash",

                contents: prompt,

                config: {
                    temperature: 0.4,

                    responseMimeType:
                        "application/json",
                },
            });

        const result =
            parseJsonObject(
                response.text
            );

        const verdict =
            allowedVerdicts.includes(
                result.verdict
            )
                ? result.verdict
                : "Partially Correct";

        const numericScore =
            Number(result.score);

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
                result.nextQuestion.question
            )
        ) {
            nextQuestion = {
                question: cleanText(
                    result.nextQuestion.question
                ),

                topic:
                    cleanText(
                        result.nextQuestion.topic
                    ) || "General",
            };
        }

        if (
            generateNextQuestion &&
            !nextQuestion
        ) {
            throw new Error(
                "Gemini did not generate the next dynamic question"
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