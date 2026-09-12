import { useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import api from "../services/api";
import ThemeSelect from "../components/ThemeSelect";

import "../styles/mcqPreparation.css";

const MCQPreparation = () => {
  const { materialId } = useParams();

  const [difficulty, setDifficulty] =
    useState("Medium");

  const [questionCount, setQuestionCount] =
    useState(10);

  const [questions, setQuestions] =
    useState([]);

  const [selectedAnswers, setSelectedAnswers] =
    useState({});

  const [showResults, setShowResults] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const generateMCQs = async () => {
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
        response.data.preparation?.content ||
        [];

      setQuestions(generatedQuestions);

      if (generatedQuestions.length === 0) {
        setError(
          "No questions were generated. Please try again"
        );
      }
    } catch (requestError) {
      console.error(
        "MCQ Generation Error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
        "Unable to generate MCQs"
      );
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
  };

  const calculateScore = () => {
    return questions.reduce(
      (total, question, index) => {
        const selectedAnswer =
          selectedAnswers[index];

        const isCorrect =
          selectedAnswer ===
          question.correctAnswer;

        return total + (isCorrect ? 1 : 0);
      },
      0
    );
  };

  const score = calculateScore();

  const answeredQuestions =
    Object.keys(selectedAnswers).length;

  const allQuestionsAnswered =
    questions.length > 0 &&
    answeredQuestions === questions.length;

  const getOptionClassName = (
    question,
    questionIndex,
    option
  ) => {
    const selected =
      selectedAnswers[questionIndex] ===
      option;

    const correct =
      showResults &&
      option === question.correctAnswer;

    const incorrect =
      showResults &&
      selected &&
      option !== question.correctAnswer;

    let className = "mcq-option";

    if (selected) {
      className += " mcq-option-selected";
    }

    if (correct) {
      className += " mcq-option-correct";
    }

    if (incorrect) {
      className +=
        " mcq-option-incorrect";
    }

    return className;
  };

  return (
    <div className="preparation-page">
      <Sidebar />

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

          <h1>AI-Generated MCQs</h1>

          <span>
            Generate multiple-choice questions
            directly from your uploaded material.
          </span>
        </header>

        <section className="generation-settings">
          <div>
            <label htmlFor="mcq-difficulty">
              Difficulty
            </label>

            <ThemeSelect
              value={difficulty}
              onChange={setDifficulty}
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
            <label htmlFor="mcq-count">
              Questions
            </label>

            <ThemeSelect
              value={String(questionCount)}
              onChange={setQuestionCount}
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
                : "Generate MCQs"}
            </span>
          </button>
        </section>

        {error && (
          <div className="preparation-error">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <section className="question-list">
            <div className="mcq-progress">
              Answered: {answeredQuestions}/
              {questions.length}
            </div>

            {questions.map(
              (question, questionIndex) => (
                <article
                  key={questionIndex}
                  className="question-card"
                >
                  <div className="question-number">
                    Question {questionIndex + 1}
                  </div>

                  <h2>
                    {question.question}
                  </h2>

                  <div className="mcq-options">
                    {question.options?.map(
                      (option, optionIndex) => (
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
                          disabled={showResults}
                        >
                          <span>
                            {String.fromCharCode(
                              65 + optionIndex
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
                        {
                          question.correctAnswer
                        }
                      </strong>

                      <p>
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </article>
              )
            )}

            {!showResults ? (
              <button
                type="button"
                className="submit-test-button"
                disabled={
                  !allQuestionsAnswered
                }
                onClick={() =>
                  setShowResults(true)
                }
              >
                <CheckCircle2 size={19} />
                Submit test
              </button>
            ) : (
              <div className="test-result">
                Your score: {score}/
                {questions.length}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default MCQPreparation;