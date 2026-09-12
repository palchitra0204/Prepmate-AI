import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  VscArchive,
  VscCommentDiscussion,
  VscHistory,
  VscHome,
} from "react-icons/vsc";

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  FileQuestion,
  FileText,
  MessageSquareText,
  Paperclip,
  Search,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";

import Dock from "../components/Dock";

import ThinkingOrb from "../components/ThinkingOrb";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const chatSectionRef = useRef(null);
  const promptInputRef = useRef(null);

  const [materials, setMaterials] =
    useState([]);

  const [preparations, setPreparations] =
    useState([]);

  const [prompt, setPrompt] =
    useState("");

  const [submittedPrompt, setSubmittedPrompt] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [dashboardLoading, setDashboardLoading] =
    useState(true);

  const [isThinking, setIsThinking] =
    useState(false);

  const [error, setError] =
    useState("");

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(() => {
      promptInputRef.current?.focus();
    }, 550);
  };

  const dockItems = [
    {
      icon: <VscHome size={20} />,
      label: "Dashboard",
      onClick: () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
    },
    {
      icon: <VscArchive size={20} />,
      label: "Materials",
      onClick: () =>
        navigate("/materials"),
    },
    {
      icon: <VscHistory size={20} />,
      label: "History",
      onClick: () =>
        navigate("/history"),
    },
    {
      icon: (
        <VscCommentDiscussion
          size={20}
        />
      ),
      label: "Chat",
      onClick: scrollToChat,
    },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setDashboardLoading(true);
        setError("");

        const [
          materialsResponse,
          historyResponse,
        ] = await Promise.all([
          api.get("/materials"),
          api.get(
            "/preparations/history"
          ),
        ]);

        setMaterials(
          materialsResponse.data
            .materials || []
        );

        setPreparations(
          historyResponse.data
            .preparations || []
        );
      } catch (requestError) {
        setError(
          requestError.response?.data
            ?.message ||
          "Unable to load dashboard"
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const completedPreparations =
    preparations.filter(
      (preparation) =>
        preparation.status ===
        "Completed"
    );

  const mcqCount =
    completedPreparations.filter(
      (preparation) =>
        preparation.mode === "MCQ"
    ).length;

  const openPreparation = (mode) => {
    navigate("/materials", {
      state: {
        preparationMode: mode,
      },
    });
  };

  const useSuggestion = (suggestion) => {
    setPrompt(suggestion);

    scrollToChat();
  };

  const handlePromptKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      event.currentTarget
        .closest("form")
        ?.requestSubmit();
    }
  };

  const handlePromptSubmit = async (
    event
  ) => {
    event.preventDefault();

    const cleanedPrompt =
      prompt.trim();

    if (!cleanedPrompt || isThinking) {
      return;
    }

    setSubmittedPrompt(cleanedPrompt);
    setPrompt("");
    setAnswer("");
    setError("");
    setIsThinking(true);

    /*
     * Temporary demonstration response.
     * Chat backend connect hone ke baad
     * is timeout ki jagah API call use hogi.
     */

    window.setTimeout(() => {
      setAnswer(
        `I have received your question: “${cleanedPrompt}”. ` +
        "Choose or upload a study material so PrepMate AI can generate an accurate answer from your content."
      );

      setIsThinking(false);
    }, 2500);
  };

  const suggestions = [
    "Generate 20 MCQs from React",
    "Explain this topic simply",
    "Create interview questions",
    "Summarize my latest PDF",
  ];

  return (
    <div className="dashboard-page">
      

      <main className="dashboard-content">
        {error && (
          <div
            className="dashboard-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="dashboard-hero">
          <div className="dashboard-glow dashboard-glow-one" />
          <div className="dashboard-glow dashboard-glow-two" />

          <div className="dashboard-badge">
            <Sparkles size={15} />

            <span>
              Smarter practice.
              Brighter results.
            </span>

            <ArrowRight size={14} />
          </div>

          <h1>
            Welcome to{" "}
            <span>PrepMate AI</span>
          </h1>

          <p>
            Hello,{" "}
            {user?.name || "Student"}!
            Your personal AI study
            companion. Practice, learn
            and get exam-ready—all in one
            place.
          </p>
        </section>

        <section className="dashboard-mode-grid">
          <button
            type="button"
            className="dashboard-mode-card mode-purple"
            onClick={() =>
              openPreparation("MCQ")
            }
          >
            <div className="mode-card-decoration">
              <FileText size={100} />
            </div>

            <div className="mode-card-icon">
              <FileQuestion size={25} />
            </div>

            <div className="mode-card-content">
              <h2>MCQ Practice</h2>

              <p>
                Test your knowledge with
                AI-generated multiple
                choice questions.
              </p>

              <span className="mode-card-stat">
                {dashboardLoading
                  ? "Loading..."
                  : `${mcqCount} sessions completed`}
              </span>
            </div>

            <span className="mode-card-arrow">
              <ArrowRight size={20} />
            </span>
          </button>

          <button
            type="button"
            className="dashboard-mode-card mode-blue"
            onClick={() =>
              openPreparation(
                "QUESTION_ANSWER"
              )
            }
          >
            <div className="mode-card-decoration">
              <MessageSquareText
                size={100}
              />
            </div>

            <div className="mode-card-icon">
              <BookOpen size={25} />
            </div>

            <div className="mode-card-content">
              <h2>
                Question &amp; Answer
              </h2>

              <p>
                Generate clear and
                accurate answers from
                your study materials.
              </p>

              <span className="mode-card-stat">
                Prepare from your notes
              </span>
            </div>

            <span className="mode-card-arrow">
              <ArrowRight size={20} />
            </span>
          </button>

          <button
            type="button"
            className="dashboard-mode-card mode-violet"
            onClick={() =>
              openPreparation(
                "INTERVIEW"
              )
            }
          >
            <div className="mode-card-decoration">
              <BrainCircuit size={100} />
            </div>

            <div className="mode-card-icon">
              <MessageSquareText
                size={25}
              />
            </div>

            <div className="mode-card-content">
              <h2>Interview Prep</h2>

              <p>
                Practice interview and
                viva questions with
                helpful suggestions.
              </p>

              <span className="mode-card-stat">
                Build your confidence
              </span>
            </div>

            <span className="mode-card-arrow">
              <ArrowRight size={20} />
            </span>
          </button>

          <button
            type="button"
            className="dashboard-mode-card mode-indigo"
            onClick={() =>
              navigate("/upload")
            }
          >
            <div className="mode-card-decoration">
              <FileText size={100} />
            </div>

            <div className="mode-card-icon">
              <Upload size={25} />
            </div>

            <div className="mode-card-content">
              <h2>Upload Material</h2>

              <p>
                Upload PDF, DOCX, TXT,
                PPT or PPTX files and
                turn them into preparation.
              </p>

              <span className="mode-card-stat">
                {dashboardLoading
                  ? "Loading..."
                  : `${materials.length} materials uploaded`}
              </span>
            </div>

            <span className="mode-card-arrow">
              <ArrowRight size={20} />
            </span>
          </button>
        </section>

        <section className="dashboard-suggestions">
          {suggestions.map(
            (suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  useSuggestion(
                    suggestion
                  )
                }
              >
                <span>
                  {suggestion}
                </span>

                <ArrowRight size={14} />
              </button>
            )
          )}
        </section>

        <section
          ref={chatSectionRef}
          className="dashboard-chat-section"
        >
          {(submittedPrompt ||
            isThinking ||
            answer) && (
              <div className="dashboard-conversation">
                {submittedPrompt && (
                  <div className="dashboard-user-message">
                    <span>You</span>

                    <p>
                      {submittedPrompt}
                    </p>
                  </div>
                )}

                {isThinking && (
                  <div className="dashboard-thinking-area">
                    <ThinkingOrb
                      message="Thinking"
                      size={250}
                    />
                  </div>
                )}

                

                {answer && (
                  <div className="dashboard-ai-message">
                    <div className="dashboard-ai-icon">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <span>
                        PrepMate AI
                      </span>

                      <p>{answer}</p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/materials"
                          )
                        }
                      >
                        Select material
                        <ArrowRight
                          size={15}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          <div className="dashboard-chat">
            <form
              onSubmit={
                handlePromptSubmit
              }
            >
              <label
                htmlFor="dashboard-prompt"
                className="sr-only"
              >
                Ask PrepMate anything
              </label>

              <textarea
                ref={promptInputRef}
                id="dashboard-prompt"
                rows="2"
                value={prompt}
                onChange={(event) =>
                  setPrompt(
                    event.target.value
                  )
                }
                onKeyDown={
                  handlePromptKeyDown
                }
                placeholder="Ask PrepMate anything..."
                disabled={isThinking}
              />

              <div className="dashboard-chat-actions">
                <div className="chat-tools">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/upload")
                    }
                  >
                    <Paperclip
                      size={16}
                    />
                    Attach file
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/materials"
                      )
                    }
                  >
                    <Search size={16} />
                    Search materials
                  </button>
                </div>

                <div className="chat-submit-area">
                  <span>
                    Press Enter to send
                  </span>

                  <button
                    type="submit"
                    className="chat-send-button"
                    aria-label="Send prompt"
                    disabled={
                      !prompt.trim() ||
                      isThinking
                    }
                  >
                    <Send size={19} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Dock
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
        distance={200}
      />
    </div>
  );
};

export default Dashboard;