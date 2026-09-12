import { useState } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import api from "../services/api";
import ThemeSelect from "../components/ThemeSelect";

import "../styles/interviewPreparation.css";

const InterviewPreparation = () => {
  const { materialId } = useParams();

  const [difficulty, setDifficulty] =
    useState("Medium");

  const [questionCount, setQuestionCount] =
    useState(10);

  const [questions, setQuestions] =
    useState([]);

  const [visibleAnswers, setVisibleAnswers] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setQuestions([]);
      setVisibleAnswers({});

      const response = await api.post(
        "/preparations/generate",
        {
          materialId,
          mode: "INTERVIEW",
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
        "Unable to generate interview questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setVisibleAnswers(
      (previousAnswers) => ({
        ...previousAnswers,
        [index]:
          !previousAnswers[index],
      })
    );
  };

  return (
    <div className="interview-page">
      <Sidebar />

      <main className="interview-content">
        <Link
          to={`/prepare/${materialId}`}
          className="interview-back"
        >
          <ArrowLeft size={18} />
          Preparation modes
        </Link>

        <header className="interview-heading">
          <p>Interview preparation</p>

          <h1>Interview & Viva Questions</h1>

          <span>
            Practise important interview questions
            based on your uploaded material.
          </span>
        </header>

        <section className="interview-settings">
          <div>
            <label htmlFor="interview-difficulty">
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
            <label htmlFor="interview-count">
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
          <div className="interview-error">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <section className="interview-list">
            {questions.map(
              (item, index) => (
                <article
                  key={index}
                  className="interview-card"
                >
                  <div className="interview-card-heading">
                    <div>
                      <MessageSquareText
                        size={21}
                      />
                    </div>

                    <span>
                      Question {index + 1}
                    </span>
                  </div>

                  <h2>{item.question}</h2>

                  <button
                    type="button"
                    className="show-answer-button"
                    onClick={() =>
                      toggleAnswer(index)
                    }
                  >
                    {visibleAnswers[index]
                      ? "Hide suggested answer"
                      : "Show suggested answer"}
                  </button>

                  {visibleAnswers[index] && (
                    <div className="interview-answer">
                      <strong>
                        Suggested answer
                      </strong>

                      <p>{item.answer}</p>

                      {item.tip && (
                        <div className="interview-tip">
                          <strong>Tip:</strong>{" "}
                          {item.tip}
                        </div>
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

export default InterviewPreparation;