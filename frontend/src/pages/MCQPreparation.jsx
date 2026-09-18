import {
useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ThemeSelect from "../components/ThemeSelect";
import api from "../services/api";

import "../styles/mcqPreparation.css";

const MCQPreparation = () => {
  const { materialId } = useParams();

  const [difficulty, setDifficulty] =
    useState("Medium");

  const [
    questionCount,
    setQuestionCount,
  ] = useState("10");

  const [questions, setQuestions] =
    useState([]);

  const [
    selectedAnswers,
    setSelectedAnswers,
  ] = useState({});

  const [showResults, setShowResults] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const getCorrectOption = (
    question
  ) => {
    const options =
      question?.options || [];

    const correctAnswer =
      question?.correctAnswer;

    if (
      typeof correctAnswer ===
      "number"
    ) {
      return (
        options[correctAnswer] ||
        options[correctAnswer - 1] ||
        ""
      );
    }

    if (
      typeof correctAnswer !==
      "string"
    ) {
      return "";
    }

    const cleanedAnswer =
      correctAnswer.trim();

    const letterMatch =
      cleanedAnswer.match(
        /^([A-D])(?:[.)\s:]|$)/i
      );

    if (letterMatch) {
      const optionIndex =
        letterMatch[1]
          .toUpperCase()
          .charCodeAt(0) - 65;

      return (
        options[optionIndex] ||
        cleanedAnswer
      );
    }

    const matchedOption =
      options.find(
        (option) =>
          String(option)
            .trim()
            .toLowerCase() ===
          cleanedAnswer.toLowerCase()
      );

    return (
      matchedOption || cleanedAnswer
    );
  };

  const generateMCQs = async () => {
    if (!materialId) {
      setError(
        "Material ID is missing. Please return to your materials and try again."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setQuestions([]);
      setSelectedAnswers({});
      setShowResults(false);

      const response = await api.post(
        "/preparations/generate",
        {
          materialId,
          mode: "MCQ",
          difficulty,
          questionCount:
            Number(questionCount),
        }
      );

      const generatedQuestions =
        response.data?.preparation
          ?.content ||
        response.data?.content ||
        [];

      if (
        !Array.isArray(
          generatedQuestions
        ) ||
        generatedQuestions.length ===
        0
      ) {
        setError(
          "No questions were generated. Please try again."
        );
        return;
      }

      setQuestions(
        generatedQuestions
      );
    } catch (requestError) {
      console.error(
        "MCQ generation error:",
        requestError.response?.data ||
        requestError
      );

      const status =
        requestError.response?.status;

      if (
        status === 401 ||
        status === 403
      ) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else if (status === 404) {
        setError(
          "The selected material was not found."
        );
      } else if (status === 429) {
        setError(
          "The AI service is currently busy. Please wait and try again."
        );
      } else {
        setError(
          requestError.response?.data
            ?.message ||
          "Unable to generate MCQs."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (
    questionIndex,
    option
  ) => {
    if (showResults) {
      return;
    }

    setSelectedAnswers(
      (previousAnswers) => ({
        ...previousAnswers,
        [questionIndex]: option,
      })
    );

    setError("");
  };

  const score = useMemo(() => {
    return questions.reduce(
      (
        total,
        question,
        questionIndex
      ) => {
        const selectedAnswer =
          selectedAnswers[
          questionIndex
          ];

        const correctOption =
          getCorrectOption(question);

        const isCorrect =
          String(selectedAnswer)
            .trim()
            .toLowerCase() ===
          String(correctOption)
            .trim()
            .toLowerCase();

        return (
          total +
          (isCorrect ? 1 : 0)
        );
      },
      0
    );
  }, [
    questions,
    selectedAnswers,
  ]);

  const answeredQuestions =
    Object.keys(
      selectedAnswers
    ).length;

  const allQuestionsAnswered =
    questions.length > 0 &&
    answeredQuestions ===
    questions.length;

  const getOptionClassName = (
    question,
    questionIndex,
    option
  ) => {
    const selected =
      selectedAnswers[
      questionIndex
      ] === option;

    const correctOption =
      getCorrectOption(question);

    const correct =
      showResults &&
      String(option)
        .trim()
        .toLowerCase() ===
      String(correctOption)
        .trim()
        .toLowerCase();

    const incorrect =
      showResults &&
      selected &&
      !correct;

    let className =
      "mcq-option";

    if (selected) {
      className +=
        " mcq-option-selected";
    }

    if (correct) {
      className +=
        " mcq-option-correct";
    }

    if (incorrect) {
      className +=
        " mcq-option-incorrect";
    }

    return className;
  };

  const submitTest = () => {
    if (!allQuestionsAnswered) {
      setError(
        "Please answer every question before submitting the test."
      );
      return;
    }

    setError("");
    setShowResults(true);
  };

  const resetTest = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scorePercentage =
    questions.length > 0
      ? Math.round(
        (score /
          questions.length) *
        100
      )
      : 0;

  return (
    <div className="preparation-page">
      <Sidebar />

      <div
        className="mcq-background-art"
        aria-hidden="true"
      >
        <span className="mcq-orbit mcq-orbit-one" />
        <span className="mcq-orbit mcq-orbit-two" />

        <span className="mcq-floating-icon mcq-float-question">
          <FileQuestion size={30} />
        </span>

        <span className="mcq-floating-icon mcq-float-book">
          <BookOpen size={30} />
        </span>

        <span className="mcq-floating-icon mcq-float-brain">
          <BrainCircuit size={29} />
        </span>

        <span className="mcq-floating-icon mcq-float-cap">
          <GraduationCap
            size={31}
          />
        </span>

        <span className="mcq-floating-icon mcq-float-sparkle">
          <Sparkles size={26} />
        </span>
      </div>

      <main className="preparation-content">
        <Link
          to={`/prepare/${materialId}`}
          className="preparation-back"
        >
          <ArrowLeft size={18} />
          Preparation modes
        </Link>

        <header className="preparation-heading">
          <p>Practice test</p>

          <h1>
            AI-Generated MCQs
          </h1>

          <span>
            Generate multiple-choice
            questions directly from
            your uploaded material.
          </span>
        </header>

        <section className="generation-settings">
          <div>
            <label>
              Difficulty
            </label>

            <ThemeSelect
              value={difficulty}
              onChange={
                setDifficulty
              }
              ariaLabel="Select difficulty"
              options={[
                {
                  value: "Easy",
                  label: "Easy",
                },
                {
                  value: "Medium",
                  label: "Medium",
                },
                {
                  value: "Hard",
                  label: "Hard",
                },
              ]}
            />
          </div>

          <div>
            <label>
              Questions
            </label>

            <ThemeSelect
              value={questionCount}
              onChange={
                setQuestionCount
              }
              ariaLabel="Select question count"
              options={[
                {
                  value: "5",
                  label: "5",
                },
                {
                  value: "10",
                  label: "10",
                },
                {
                  value: "15",
                  label: "15",
                },
                {
                  value: "20",
                  label: "20",
                },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={generateMCQs}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle
                className="spin-icon"
                size={19}
              />
            ) : (
              <Sparkles size={19} />
            )}

            <span>
              {loading
                ? "Generating..."
                : questions.length > 0
                  ? "Generate Again"
                  : "Generate MCQs"}
            </span>
          </button>
        </section>

        {error && (
          <div
            className="preparation-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <section className="question-list">
            <div className="mcq-progress">
              <span>
                Answered
              </span>

              <strong>
                {answeredQuestions}/
                {questions.length}
              </strong>
            </div>

            {questions.map(
              (
                question,
                questionIndex
              ) => {
                const correctOption =
                  getCorrectOption(
                    question
                  );

                return (
                  <article
                    key={
                      question.id ||
                      `question-${questionIndex}`
                    }
                    className="question-card"
                  >
                    <div className="question-number">
                      Question{" "}
                      {questionIndex +
                        1}
                    </div>

                    <h2>
                      {
                        question.question
                      }
                    </h2>

                    <div className="mcq-options">
                      {question.options?.map(
                        (
                          option,
                          optionIndex
                        ) => (
                          <button
                            key={`${questionIndex}-${optionIndex}`}
                            type="button"
                            className={getOptionClassName(
                              question,
                              questionIndex,
                              option
                            )}
                            onClick={() =>
                              selectAnswer(
                                questionIndex,
                                option
                              )
                            }
                            disabled={
                              showResults
                            }
                            aria-pressed={
                              selectedAnswers[
                              questionIndex
                              ] === option
                            }
                          >
                            <span>
                              {String.fromCharCode(
                                65 +
                                optionIndex
                              )}
                            </span>

                            {option}
                          </button>
                        )
                      )}
                    </div>

                    {showResults && (
                      <div className="answer-explanation">
                        <strong>
                          Correct answer:{" "}
                          {correctOption}
                        </strong>

                        <p>
                          {question.explanation ||
                            "No explanation was provided."}
                        </p>
                      </div>
                    )}
                  </article>
                );
              }
            )}

            {!showResults ? (
              <button
                type="button"
                className="submit-test-button"
                disabled={
                  !allQuestionsAnswered
                }
                onClick={submitTest}
              >
                <CheckCircle2
                  size={19}
                />
                Submit test
              </button>
            ) : (
              <div className="test-result">
                <CheckCircle2
                  size={27}
                />

                <div>
                  <span>
                    Your score
                  </span>

                  <strong>
                    {score}/
                    {questions.length}
                  </strong>

                  <p>
                    {scorePercentage}%
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetTest}
                >
                  <RotateCcw
                    size={17}
                  />
                  Try again
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default MCQPreparation;