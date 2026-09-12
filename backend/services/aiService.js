const { GoogleGenAI } = require(
  "@google/genai"
);

const stopWords = new Set([
  "this",
  "that",
  "these",
  "those",
  "with",
  "from",
  "have",
  "has",
  "were",
  "was",
  "will",
  "would",
  "could",
  "should",
  "into",
  "about",
  "their",
  "there",
  "which",
  "when",
  "where",
  "what",
  "than",
  "then",
  "also",
  "such",
  "because",
  "between",
  "through",
  "using",
  "used",
  "user",
  "your",
  "they",
  "them",
  "each",
  "other",
  "more",
  "most",
  "some",
  "many",
  "only",
]);

// const generateGeminiContent = async ({
//   text,
//   mode,
//   difficulty,
//   questionCount,
// }) => {
//   if (!process.env.GEMINI_API_KEY) {
//     throw new Error(
//       "GEMINI_API_KEY is missing in the .env file"
//     );
//   }

//   const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//   });

//   const modeInstructions =
//     getModeInstructions(
//       mode,
//       questionCount
//     );

//   const materialText = cleanText(text).slice(
//     0,
//     60000
//   );

//   const prompt = `
// Your existing prompt remains here...
// `;

//   // Add it here, immediately before the API request
//   console.log(
//     `Generating with Gemini model: ${process.env.GEMINI_MODEL ||
//     "gemini-3-flash-preview"
//     }`
//   );

//   const response =
//     await ai.models.generateContent({
//       model:
//         process.env.GEMINI_MODEL ||
//         "gemini-3-flash-preview",

//       contents: prompt,

//       config: {
//         temperature: 0.4,
//         responseMimeType:
//           "application/json",
//       },
//     });

//   console.log(
//     "Gemini generation successful"
//   );

//   return parseGeneratedContent(
//     response.text
//   );
// };

const cleanText = (text) => {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const getSentences = (text) => {
  const cleanedText = cleanText(text);

  let sentences = cleanedText
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(
      (sentence) =>
        sentence.length >= 30 &&
        sentence.length <= 500
    );

  if (sentences.length === 0) {
    sentences = cleanedText
      .split("\n")
      .map((sentence) => sentence.trim())
      .filter(
        (sentence) =>
          sentence.length >= 20
      );
  }

  return sentences;
};

const getKeywords = (text) => {
  const words = cleanText(text)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 4 &&
        !stopWords.has(word)
    );

  const frequencies = {};

  words.forEach((word) => {
    frequencies[word] =
      (frequencies[word] || 0) + 1;
  });

  return Object.entries(frequencies)
    .sort(
      (first, second) =>
        second[1] - first[1]
    )
    .map(([word]) => word)
    .slice(0, 80);
};

const capitalize = (value) => {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
};

const findKeyword = (
  sentence,
  keywords
) => {
  const lowerSentence =
    sentence.toLowerCase();

  return keywords.find((keyword) =>
    lowerSentence.includes(keyword)
  );
};

const generateDemoMCQs = (
  text,
  questionCount
) => {
  const sentences = getSentences(text);
  const keywords = getKeywords(text);

  if (sentences.length === 0) {
    throw new Error(
      "Not enough readable content to generate MCQs"
    );
  }

  return Array.from(
    {
      length: questionCount,
    },
    (_, index) => {
      const sentence =
        sentences[index % sentences.length];

      const correctKeyword =
        findKeyword(sentence, keywords) ||
        keywords[index % keywords.length] ||
        "Content";

      const incorrectKeywords =
        keywords.filter(
          (keyword) =>
            keyword !== correctKeyword
        );

      const wrongOptions = [];

      for (
        let offset = 0;
        offset < 3;
        offset += 1
      ) {
        const wrongOption =
          incorrectKeywords[
          (index + offset) %
          Math.max(
            incorrectKeywords.length,
            1
          )
          ] ||
          `Incorrect option ${offset + 1}`;

        wrongOptions.push(
          capitalize(wrongOption)
        );
      }

      const correctAnswer =
        capitalize(correctKeyword);

      let questionText =
        sentence.replace(
          new RegExp(
            `\\b${correctKeyword}\\b`,
            "i"
          ),
          "________"
        );

      if (questionText === sentence) {
        questionText =
          `Which important concept is discussed in this statement: "${sentence}"?`;
      } else {
        questionText =
          `Fill in the blank: ${questionText}`;
      }

      const options = [
        correctAnswer,
        ...wrongOptions,
      ];

      const shift =
        index % options.length;

      const shuffledOptions = [
        ...options.slice(shift),
        ...options.slice(0, shift),
      ];

      return {
        question: questionText,
        options: shuffledOptions,
        correctAnswer,
        explanation: sentence,
      };
    }
  );
};

const generateDemoQuestionAnswers = (
  text,
  questionCount
) => {
  const sentences = getSentences(text);
  const keywords = getKeywords(text);

  if (sentences.length === 0) {
    throw new Error(
      "Not enough readable content to generate questions"
    );
  }

  return Array.from(
    {
      length: questionCount,
    },
    (_, index) => {
      const sentence =
        sentences[index % sentences.length];

      const keyword =
        findKeyword(sentence, keywords) ||
        `Topic ${index + 1}`;

      return {
        question:
          `What does the study material explain about ${capitalize(
            keyword
          )}?`,

        answer: sentence,

        explanation:
          "This answer is generated directly from the uploaded study material.",
      };
    }
  );
};

const generateDemoInterviewQuestions = (
  text,
  questionCount
) => {
  const sentences = getSentences(text);
  const keywords = getKeywords(text);

  if (sentences.length === 0) {
    throw new Error(
      "Not enough readable content to generate interview questions"
    );
  }

  return Array.from(
    {
      length: questionCount,
    },
    (_, index) => {
      const sentence =
        sentences[index % sentences.length];

      const keyword =
        findKeyword(sentence, keywords) ||
        `Topic ${index + 1}`;

      return {
        question:
          `Can you explain ${capitalize(
            keyword
          )} in your own words?`,

        answer: sentence,

        tip:
          "Explain the concept clearly and include a practical example if possible.",
      };
    }
  );
};

const generateDemoContent = ({
  text,
  mode,
  questionCount,
}) => {
  if (mode === "MCQ") {
    return generateDemoMCQs(
      text,
      questionCount
    );
  }

  if (mode === "QUESTION_ANSWER") {
    return generateDemoQuestionAnswers(
      text,
      questionCount
    );
  }

  if (mode === "INTERVIEW") {
    return generateDemoInterviewQuestions(
      text,
      questionCount
    );
  }

  throw new Error(
    "Invalid preparation mode"
  );
};

const getModeInstructions = (
  mode,
  questionCount
) => {
  if (mode === "MCQ") {
    return `
Generate exactly ${questionCount} multiple-choice questions.

Each array item must use this structure:
{
  "question": "Question based on the material",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctAnswer": "Exact text of one option",
  "explanation": "Short explanation from the material"
}

Requirements:
- Every question must have exactly four unique options.
- correctAnswer must exactly match one option.
- Avoid duplicate questions.
`;
  }

  if (mode === "QUESTION_ANSWER") {
    return `
Generate exactly ${questionCount} study questions and answers.

Each array item must use this structure:
{
  "question": "Question based on the material",
  "answer": "Clear answer based on the material",
  "explanation": "Short additional explanation"
}

Requirements:
- Include important conceptual questions.
- Keep answers clear and educational.
- Avoid duplicate questions.
`;
  }

  if (mode === "INTERVIEW") {
    return `
Generate exactly ${questionCount} interview or viva questions.

Each array item must use this structure:
{
  "question": "Interview question",
  "answer": "Suggested answer based on the material",
  "tip": "Short tip for answering confidently"
}

Requirements:
- Questions must be suitable for interview or viva preparation.
- Answers must remain grounded in the material.
- Avoid duplicate questions.
`;
  }

  throw new Error(
    "Invalid preparation mode"
  );
};

const removeMarkdownCodeBlock = (
  value
) => {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

const parseGeneratedContent = (
  outputText
) => {
  if (!outputText?.trim()) {
    throw new Error(
      "Gemini did not return any content"
    );
  }

  const cleanedOutput =
    removeMarkdownCodeBlock(
      outputText
    );

  let parsedContent;

  try {
    parsedContent =
      JSON.parse(cleanedOutput);
  } catch (error) {
    console.error(
      "Invalid Gemini JSON:",
      outputText
    );

    throw new Error(
      "Gemini returned invalid JSON. Please try again"
    );
  }

  if (!Array.isArray(parsedContent)) {
    throw new Error(
      "Gemini response is not a JSON array"
    );
  }

  if (parsedContent.length === 0) {
    throw new Error(
      "Gemini returned an empty result"
    );
  }

  return parsedContent;
};

const generateGeminiContent = async ({
  text,
  mode,
  difficulty,
  questionCount,
}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing in the .env file"
    );
  }

  const ai = new GoogleGenAI({
    apiKey:
      process.env.GEMINI_API_KEY,
  });

  const modeInstructions =
    getModeInstructions(
      mode,
      questionCount
    );

  const maximumCharacters = 60000;

  const materialText = cleanText(
    text
  ).slice(0, maximumCharacters);

  const prompt = `
You are PrepMate AI, an educational preparation assistant.

Generate preparation content only from the supplied study material.

Rules:
- Do not add facts that are absent from the material.
- Requested difficulty: ${difficulty}.
- Return only a valid JSON array.
- Do not include Markdown code fences.
- Do not add headings or text outside the JSON array.
- Use clear English suitable for students.

${modeInstructions}

STUDY MATERIAL:

${materialText}
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

  return parseGeneratedContent(
    response.text
  );
};

const generatePreparationContent =
  async ({
    text,
    mode,
    difficulty = "Medium",
    questionCount = 10,
  }) => {
    if (!text?.trim()) {
      throw new Error(
        "Material text is required"
      );
    }

    const totalQuestions =
      Number(questionCount);

    if (
      !Number.isInteger(totalQuestions) ||
      totalQuestions < 1 ||
      totalQuestions > 50
    ) {
      throw new Error(
        "Question count must be between 1 and 50"
      );
    }

    const demoMode =
      process.env.DEMO_MODE === "true";

    const provider =
      (
        process.env.AI_PROVIDER ||
        "gemini"
      ).toLowerCase();

    if (demoMode) {
      return generateDemoContent({
        text,
        mode,
        questionCount:
          totalQuestions,
      });
    }

    if (provider !== "gemini") {
      throw new Error(
        `Unsupported AI provider: ${provider}`
      );
    }

    try {
      return await generateGeminiContent({
        text,
        mode,
        difficulty,
        questionCount:
          totalQuestions,
      });
    } catch (error) {
      console.error(
        "Gemini Generation Error:",
        error.message
      );

      const fallbackEnabled =
        process.env
          .GEMINI_FALLBACK_TO_DEMO !==
        "false";

      if (fallbackEnabled) {
        console.warn(
          "Gemini unavailable. Using demo fallback"
        );

        return generateDemoContent({
          text,
          mode,
          questionCount:
            totalQuestions,
        });
      }

      throw error;
    }
  };

module.exports = {
  generatePreparationContent,
};