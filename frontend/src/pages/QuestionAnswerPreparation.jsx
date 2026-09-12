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
import api from "../services/api";
import ThemeSelect from "../components/ThemeSelect";

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

  const [error, setError] = useState("");

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setQuestions([]);
      setOpenAnswers({});

      const response = await api.post(
        "/preparations/generate",
        {
          materialId,
          mode: "QUESTION_ANSWER",
          difficulty,
          questionCount:
            Number(questionCount),
        }
      );

      setQuestions(
        response.data.preparation?.content || []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Unable to generate questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setOpenAnswers((previousAnswers) => ({
      ...previousAnswers,
      [index]: !previousAnswers[index],
    }));
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

        <section className="qa-settings">
          <div>
            <label htmlFor="qa-difficulty">
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
            <label htmlFor="qa-count">
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
            onClick={generateQuestions}
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

            {loading
              ? "Generating..."
              : "Generate questions"}
          </button>
        </section>

        {error && (
          <div className="qa-error">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <section className="qa-list">
            {questions.map(
              (item, index) => (
                <article
                  key={index}
                  className="qa-card"
                >
                  <button
                    type="button"
                    className="qa-question"
                    onClick={() =>
                      toggleAnswer(index)
                    }
                  >
                    <span>
                      Q{index + 1}
                    </span>

                    <strong>
                      {item.question}
                    </strong>

                    <span>
                      {openAnswers[index]
                        ? "−"
                        : "+"}
                    </span>
                  </button>

                  {openAnswers[index] && (
                    <div className="qa-answer">
                      <strong>Answer</strong>
                      <p>{item.answer}</p>

                      {item.explanation && (
                        <small>
                          {item.explanation}
                        </small>
                      )}
                    </div>
                  )}
                </article>
              )
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default QuestionAnswerPreparation;