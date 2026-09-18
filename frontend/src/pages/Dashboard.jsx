import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  VscArchive,
  VscCommentDiscussion,
  VscHistory,
  VscHome,
  VscSettingsGear,
} from "react-icons/vsc";

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  FileQuestion,
  FileText,
  GraduationCap,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";

import Dock from "../components/Dock";
import ThinkingOrb from "../components/ThinkingOrb";

import {
  useAuth,
} from "../context/AuthContext";

import api from "../services/api";

import "../styles/dashboard.css";


const Dashboard = () => {
  const navigate =
    useNavigate();


  const {
    user,
  } = useAuth();


  const chatSectionRef =
    useRef(null);


  const promptInputRef =
    useRef(null);


  const [
    materials,
    setMaterials,
  ] = useState([]);


  const [
    preparations,
    setPreparations,
  ] = useState([]);


  const [
    prompt,
    setPrompt,
  ] = useState("");


  const [
    submittedPrompt,
    setSubmittedPrompt,
  ] = useState("");


  const [
    answer,
    setAnswer,
  ] = useState("");


  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(true);


  const [
    isThinking,
    setIsThinking,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     CHAT SCROLL
  ===================================================== */

  const scrollToChat = () => {
    chatSectionRef.current
      ?.scrollIntoView({
        behavior:
          "smooth",

        block:
          "center",
      });


    window.setTimeout(
      () => {
        promptInputRef.current
          ?.focus();
      },

      550
    );
  };


  /* =====================================================
     DOCK
  ===================================================== */

  const dockItems = [
    {
      icon:
        <VscHome size={20} />,

      label:
        "Dashboard",

      onClick: () => {
        window.scrollTo({
          top:
            0,

          behavior:
            "smooth",
        });
      },
    },

    {
      icon:
        <VscArchive size={20} />,

      label:
        "Materials",

      onClick: () =>
        navigate(
          "/materials"
        ),
    },

    {
      icon:
        <VscHistory size={20} />,

      label:
        "History",

      onClick: () =>
        navigate(
          "/history"
        ),
    },

    {
      icon:
        <VscCommentDiscussion
          size={20}
        />,

      label:
        "Assistant",

      onClick:
        scrollToChat,
    },

    {
      icon:
        <VscSettingsGear
          size={20}
        />,

      label:
        "Settings",

      onClick: () =>
        navigate(
          "/settings"
        ),
    },
  ];


  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setDashboardLoading(
            true
          );

          setError("");


          const [
            materialsResponse,
            historyResponse,
          ] =
            await Promise.all([
              api.get(
                "/materials"
              ),

              api.get(
                "/preparations/history"
              ),
            ]);


          setMaterials(
            materialsResponse.data
              .materials ||
            []
          );


          setPreparations(
            historyResponse.data
              .preparations ||
            []
          );

        } catch (
        requestError
        ) {
          console.error(
            "Dashboard load error:",
            requestError.response
              ?.data ||
            requestError
          );


          setError(
            requestError.response
              ?.data?.message ||
            "Unable to load dashboard"
          );

        } finally {
          setDashboardLoading(
            false
          );
        }
      };


    loadDashboard();

  }, []);


  /* =====================================================
     PREPARATION COUNTS
  ===================================================== */

  const completedPreparations =
    preparations.filter(
      (
        preparation
      ) =>
        String(
          preparation.status ||
          ""
        ).toLowerCase() ===
        "completed"
    );


  const getModeCount = (
    mode
  ) => {
    return completedPreparations
      .filter(
        (
          preparation
        ) =>
          preparation.mode ===
          mode
      )
      .length;
  };


  const mcqCount =
    getModeCount(
      "MCQ"
    );


  const questionAnswerCount =
    getModeCount(
      "QUESTION_ANSWER"
    );


  const interviewCount =
    getModeCount(
      "INTERVIEW"
    );


  /* =====================================================
     PREPARATION NAVIGATION
  ===================================================== */

  const openPreparation = (
    mode
  ) => {
    navigate(
      "/materials",
      {
        state: {
          preparationMode:
            mode,
        },
      }
    );
  };


  /* =====================================================
     SUGGESTIONS
  ===================================================== */

  const useSuggestion = (
    suggestion
  ) => {
    setPrompt(
      suggestion
    );

    scrollToChat();
  };


  const suggestions = [
    "Generate 20 MCQs from my material",

    "Explain a topic simply",

    "Create interview questions",

    "Summarize my latest material",
  ];


  /* =====================================================
     TEMPORARY ASSISTANT
  ===================================================== */

  const handlePromptKeyDown = (
    event
  ) => {
    if (
      event.key ===
      "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();


      event.currentTarget
        .closest(
          "form"
        )
        ?.requestSubmit();
    }
  };


  const handlePromptSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      const cleanedPrompt =
        prompt.trim();


      if (
        !cleanedPrompt ||
        isThinking
      ) {
        return;
      }


      setSubmittedPrompt(
        cleanedPrompt
      );


      setPrompt("");

      setAnswer("");

      setError("");

      setIsThinking(
        true
      );


      /*
       * Temporary assistant preview.
       * Real RAG chat API will replace
       * this response later.
       */

      window.setTimeout(
        () => {
          setAnswer(
            `I received your request: “${cleanedPrompt}”. ` +
            "Select an existing study material or upload a new one so PrepMate can prepare an accurate response from your content."
          );


          setIsThinking(
            false
          );
        },

        1800
      );
    };


  return (
    <div className="dashboard-page">

      {/* =================================================
          FLOATING BACKGROUND
      ================================================= */}

      <div
        className="dashboard-background-art"
        aria-hidden="true"
      >
        <span className="dashboard-orbit dashboard-orbit-one" />

        <span className="dashboard-orbit dashboard-orbit-two" />

        <span className="dashboard-orbit dashboard-orbit-three" />


        <span className="dashboard-floating-icon dashboard-float-book">
          <BookOpen size={32} />
        </span>


        <span className="dashboard-floating-icon dashboard-float-brain">
          <BrainCircuit size={31} />
        </span>


        <span className="dashboard-floating-icon dashboard-float-question">
          <FileQuestion size={30} />
        </span>


        <span className="dashboard-floating-icon dashboard-float-cap">
          <GraduationCap size={33} />
        </span>


        <span className="dashboard-floating-icon dashboard-float-file">
          <FileText size={29} />
        </span>


        <span className="dashboard-floating-icon dashboard-float-sparkle">
          <Sparkles size={24} />
        </span>
      </div>


      <main className="dashboard-content">

        {/* ERROR */}

        {error && (
          <div
            className="dashboard-error"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* =================================================
            HERO
        ================================================= */}

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

            <span>
              PrepMate AI
            </span>
          </h1>


          <p>
            Hello,{" "}

            <strong>
              {user?.name ||
                "Student"}
            </strong>
            ! Your personal AI study
            companion. Practice, learn
            and get exam-ready—all in
            one place.
          </p>

        </section>


        {/* =================================================
            PREPARATION CARDS
        ================================================= */}

        <section className="dashboard-mode-grid">

          {/* MCQ */}

          <button
            type="button"

            className="
              dashboard-mode-card
              mode-purple
            "

            onClick={() =>
              openPreparation(
                "MCQ"
              )
            }
          >
            <div className="mode-card-decoration">
              <FileText size={100} />
            </div>


            <div className="mode-card-icon">
              <FileQuestion size={25} />
            </div>


            <div className="mode-card-content">

              <h2>
                MCQ Practice
              </h2>


              <p>
                Test your knowledge
                with AI-generated
                multiple-choice
                questions.
              </p>


              <span className="mode-card-stat">
                {dashboardLoading
                  ? "Loading..."
                  : `${mcqCount} sessions completed`
                }
              </span>

            </div>


            <span className="mode-card-arrow">
              <ArrowRight size={20} />
            </span>
          </button>


          {/* QUESTION ANSWER */}

          <button
            type="button"

            className="
              dashboard-mode-card
              mode-purple
            "

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
                {dashboardLoading
                  ? "Loading..."
                  : `${questionAnswerCount} sessions completed`
                }
              </span>

            </div>


            <span className="mode-card-arrow">
              <ArrowRight size={20} />
            </span>
          </button>


          {/* INTERVIEW */}

          <button
            type="button"

            className="
              dashboard-mode-card
              mode-purple
            "

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
              <MessageSquareText size={25} />
            </div>


            <div className="mode-card-content">

              <h2>
                Interview Prep
              </h2>


              <p>
                Practice interview and
                viva questions with
                helpful suggestions.
              </p>


              <span className="mode-card-stat">
                {dashboardLoading
                  ? "Loading..."
                  : `${interviewCount} sessions completed`
                }
              </span>

            </div>


            <span className="mode-card-arrow">
              <ArrowRight size={20} />
            </span>
          </button>


          {/* UPLOAD */}

          <button
            type="button"

            className="
              dashboard-mode-card
              mode-purple
            "

            onClick={() =>
              navigate(
                "/upload"
              )
            }
          >
            <div className="mode-card-decoration">
              <FileText size={100} />
            </div>


            <div className="mode-card-icon">
              <Upload size={25} />
            </div>


            <div className="mode-card-content">

              <h2>
                Upload Material
              </h2>


              <p>
                Upload PDF, DOC, DOCX,
                TXT or PPTX files and
                turn them into study
                preparation.
              </p>


              <span className="mode-card-stat">
                {dashboardLoading
                  ? "Loading..."
                  : `${materials.length} materials uploaded`
                }
              </span>

            </div>


            <span className="mode-card-arrow">
              <ArrowRight size={20} />
            </span>
          </button>

        </section>


        {/* =================================================
            SUGGESTIONS
        ================================================= */}

        <section className="dashboard-suggestions">

          {suggestions.map(
            (
              suggestion
            ) => (
              <button
                key={
                  suggestion
                }

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


        {/* =================================================
            QUICK ASSISTANT
        ================================================= */}

        <section
          ref={
            chatSectionRef
          }

          className="dashboard-chat-section"
        >

          <div className="dashboard-assistant-heading">

            <div>

              <p>
                Quick Assistant
              </p>


              {/* <h2>
                What would you like
                to prepare?
              </h2> */}

            </div>


            {/* <span>
              Material-based RAG chat
              coming next
            </span> */}

          </div>


          {(submittedPrompt ||
            isThinking ||
            answer) && (

              <div className="dashboard-conversation">

                {submittedPrompt && (

                  <div className="dashboard-user-message">

                    <span>
                      You
                    </span>


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


                      <p>
                        {answer}
                      </p>


                      <button
                        type="button"

                        onClick={() =>
                          navigate(
                            "/materials"
                          )
                        }
                      >
                        Select material

                        <ArrowRight size={15} />
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
                ref={
                  promptInputRef
                }

                id="dashboard-prompt"

                rows="2"

                value={
                  prompt
                }

                onChange={(
                  event
                ) =>
                  setPrompt(
                    event.target.value
                  )
                }

                onKeyDown={
                  handlePromptKeyDown
                }

                placeholder="Ask PrepMate anything..."

                disabled={
                  isThinking
                }
              />


              <div className="dashboard-chat-actions">

                <div className="chat-tools">

                  <button
                    type="button"

                    onClick={() =>
                      navigate(
                        "/upload"
                      )
                    }
                  >
                    <Upload size={16} />

                    Upload material
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
        items={
          dockItems
        }

        panelHeight={68}

        baseItemSize={50}

        magnification={70}

        distance={200}
      />

    </div>
  );
};


export default Dashboard;