import { useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Database,
  FileQuestion,
  GraduationCap,
  History,
  LoaderCircle,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ThemeSelect from "../components/ThemeSelect";
import api from "../services/api";

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

  const [error, setError] =
    useState("");

  const generateQuestions = async () => {
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
      setVisibleAnswers({});

      const response = await api.post(
        "/preparations/generate",
        {
          materialId,
          mode: "INTERVIEW",
          difficulty,
          questionCount: Number(questionCount),
        }
      );

      const generatedQuestions =
        response.data?.preparation?.content ||
        response.data?.content ||
        [];

      if (
        !Array.isArray(generatedQuestions) ||
        generatedQuestions.length === 0
      ) {
        setError(
          "No interview questions were generated. Please try again."
        );
        return;
      }

      setQuestions(generatedQuestions);
    } catch (requestError) {
      console.error(
        "Interview generation error:",
        requestError.response?.data ||
        requestError
      );

      setError(
        requestError.response?.data?.message ||
        "Unable to generate interview questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setVisibleAnswers((previousAnswers) => ({
      ...previousAnswers,
      [index]: !previousAnswers[index],
    }));
  };

  return (
    <div className="interview-page">
      <Sidebar />

      <div
        className="interview-background-art"
        aria-hidden="true"
      >
        <span className="interview-orbit interview-orbit-one" />
        <span className="interview-orbit interview-orbit-two" />
        <span className="interview-orbit interview-orbit-three" />
        <span className="interview-orbit interview-orbit-four" />

        <span className="interview-floating-icon interview-float-one">
          <MessageSquareText size={24} />
        </span>

        <span className="interview-floating-icon interview-float-two">
          <BookOpen size={24} />
        </span>

        <span className="interview-floating-icon interview-float-three">
          <BrainCircuit size={24} />
        </span>

        <span className="interview-floating-icon interview-float-four">
          <GraduationCap size={25} />
        </span>

        <span className="interview-floating-icon interview-float-five">
          <FileQuestion size={23} />
        </span>

        <span className="interview-floating-icon interview-float-six">
          <Database size={22} />
        </span>

        <span className="interview-floating-icon interview-float-seven">
          <History size={23} />
        </span>

        <span className="interview-floating-icon interview-float-eight">
          <Sparkles size={22} />
        </span>
      </div>

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
            <label>Difficulty</label>

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
            <label>Questions</label>

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
              : questions.length > 0
                ? "Generate again"
                : "Generate questions"}
          </button>
        </section>

        {error && (
          <div
            className="interview-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <section className="interview-list">
            {questions.map((item, index) => (
              <article
                key={
                  item.id ||
                  `interview-question-${index}`
                }
                className="interview-card"
              >
                <div className="interview-card-heading">
                  <div>
                    <MessageSquareText size={21} />
                  </div>

                  <span>
                    Question {index + 1}
                  </span>
                </div>

                <h2>{item.question}</h2>

                <button
                  type="button"
                  className="show-answer-button"
                  aria-expanded={
                    Boolean(visibleAnswers[index])
                  }
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
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default InterviewPreparation;