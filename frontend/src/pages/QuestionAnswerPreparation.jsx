import { useState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ThemeSelect from "../components/ThemeSelect";
import api from "../services/api";

import "../styles/questionAnswerPreparation.css";

const QuestionAnswerPreparation = () => {
  const { materialId } = useParams();

  const [difficulty, setDifficulty] =
    useState("Medium");

  const [questionCount, setQuestionCount] =
    useState(10);

  const [questions, setQuestions] =
    useState([]);

  const [openAnswers, setOpenAnswers] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [hasGenerated, setHasGenerated] =
    useState(false);

  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (!materialId || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setQuestions([]);
      setOpenAnswers({});
      setHasGenerated(false);

      const response = await api.post(
        "/preparations/generate",
        {
          materialId,
          mode: "QUESTION_ANSWER",
          difficulty,
          questionCount:
            Number(questionCount),
        },
      );

      const generatedContent =
        response.data?.preparation?.content;

      const generatedQuestions =
        Array.isArray(generatedContent)
          ? generatedContent
          : Array.isArray(
            generatedContent?.questions,
          )
            ? generatedContent.questions
            : [];

      setQuestions(generatedQuestions);
      setHasGenerated(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Unable to generate questions",
      );

      setQuestions([]);
      setHasGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setOpenAnswers(
      (previousAnswers) => ({
        ...previousAnswers,
        [index]:
          !previousAnswers[index],
      }),
    );
  };

  return (
    <div className="qa-page">
      <Sidebar />

      <main className="qa-content">
        <Link
          to={`/prepare/${materialId}`}
          className="qa-back"
        >
          <ArrowLeft size={18} />
          Preparation modes
        </Link>

        <header className="qa-heading">
          <p>Study preparation</p>

          <h1>Question & Answers</h1>

          <span>
            Generate important questions and
            answers from your material.
          </span>
        </header>

        <section
          className="qa-settings"
          aria-label="Question generation settings"
        >
          <div>
            <label htmlFor="qa-difficulty">
              Difficulty
            </label>

            <ThemeSelect
              id="qa-difficulty"
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
            <label htmlFor="qa-count">
              Questions
            </label>

            <ThemeSelect
              id="qa-count"
              value={String(questionCount)}
              onChange={(value) =>
                setQuestionCount(
                  Number(value),
                )
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
            onClick={generateQuestions}
            disabled={loading || !materialId}
          >
            {loading ? (
              <LoaderCircle
                className="spin-icon"
                size={19}
              />
            ) : (
              <Sparkles size={19} />
            )}

            {loading
              ? "Generating..."
              : "Generate questions"}
          </button>
        </section>

        {error && (
          <div
            className="qa-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          hasGenerated &&
          questions.length === 0 && (
            <div className="qa-empty">
              <Sparkles size={22} />

              <div>
                <strong>
                  No questions generated
                </strong>

                <p>
                  Please try another difficulty
                  or question count.
                </p>
              </div>
            </div>
          )}

        {questions.length > 0 && (
          <section
            className="qa-list"
            aria-label="Generated questions"
          >
            {questions.map(
              (item, index) => {
                const answerIsOpen =
                  Boolean(
                    openAnswers[index],
                  );

                const answerId = `qa-answer-${index}`;
                const questionId = `qa-question-${index}`;

                return (
                  <article
                    key={
                      item._id ||
                      `${item.question}-${index}`
                    }
                    className="qa-card"
                  >
                    <button
                      id={questionId}
                      type="button"
                      className="qa-question"
                      aria-expanded={
                        answerIsOpen
                      }
                      aria-controls={answerId}
                      onClick={() =>
                        toggleAnswer(index)
                      }
                    >
                      <span>
                        Q{index + 1}
                      </span>

                      <strong>
                        {item.question ||
                          "Question unavailable"}
                      </strong>

                      <span
                        aria-hidden="true"
                      >
                        {answerIsOpen
                          ? "−"
                          : "+"}
                      </span>
                    </button>

                    {answerIsOpen && (
                      <div
                        id={answerId}
                        className="qa-answer"
                        role="region"
                        aria-labelledby={
                          questionId
                        }
                      >
                        <strong>
                          Answer
                        </strong>

                        <p>
                          {item.answer ||
                            "Answer unavailable"}
                        </p>

                        {item.explanation && (
                          <small>
                            {
                              item.explanation
                            }
                          </small>
                        )}
                      </div>
                    )}
                  </article>
                );
              },
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default QuestionAnswerPreparation;