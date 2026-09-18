import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ArrowLeft,
    BookOpen,
    BrainCircuit,
    CheckCircle2,
    CircleStop,
    FileQuestion,
    GraduationCap,
    Headphones,
    LoaderCircle,
    MessageSquareText,
    Mic2,
    Play,
    Radio,
    RotateCcw,
    Sparkles,
    Square,
    Volume2,
} from "lucide-react";

import {
    Link,
    useLocation,
    useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ThemeSelect from "../components/ThemeSelect";
import api from "../services/api";

import "../styles/virtualInterview.css";

const interviewTypes = [
    {
        value: "STUDY_VIVA",
        label: "Study Viva",
    },
    {
        value: "RESUME_INTERVIEW",
        label: "Resume Interview",
    },
    {
        value: "TECHNICAL_INTERVIEW",
        label: "Technical Interview",
    },
    {
        value: "GENERAL_INTERVIEW",
        label: "General Interview",
    },
];

const VirtualInterview = () => {
    const { materialId } = useParams();
    const location = useLocation();

    const material =
        location.state?.material;

    const recognitionRef = useRef(null);
    const mountedRef = useRef(true);

    const [interviewType, setInterviewType] =
        useState("STUDY_VIVA");

    const [questionStyle, setQuestionStyle] =
        useState("");

    const [difficulty, setDifficulty] =
        useState("Medium");

    const [questionCount, setQuestionCount] =
        useState("10");

    const [session, setSession] =
        useState(null);

    const [screen, setScreen] =
        useState("SETUP");

    const [transcript, setTranscript] =
        useState("");

    const [
        interimTranscript,
        setInterimTranscript,
    ] = useState("");

    const [evaluation, setEvaluation] =
        useState(null);

    const [speechSupported, setSpeechSupported] =
        useState(true);

    const [isListening, setIsListening] =
        useState(false);

    const [isSpeaking, setIsSpeaking] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const currentQuestion = useMemo(() => {
        if (!session?.questions?.length) {
            return null;
        }

        return (
            session.questions.find(
                (item) =>
                    item.questionNumber ===
                    session.currentQuestionNumber
            ) || null
        );
    }, [session]);

    const stopSpeaking = useCallback(() => {
        if (
            typeof window !== "undefined" &&
            window.speechSynthesis
        ) {
            window.speechSynthesis.cancel();
        }

        setIsSpeaking(false);
    }, []);

    const speakText = useCallback(
        (text) => {
            if (
                !text ||
                typeof window === "undefined" ||
                !window.speechSynthesis
            ) {
                return;
            }

            window.speechSynthesis.cancel();

            const utterance =
                new SpeechSynthesisUtterance(
                    text
                );

            utterance.lang = "en-IN";
            utterance.rate = 0.92;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => {
                if (mountedRef.current) {
                    setIsSpeaking(true);
                }
            };

            utterance.onend = () => {
                if (mountedRef.current) {
                    setIsSpeaking(false);
                }
            };

            utterance.onerror = () => {
                if (mountedRef.current) {
                    setIsSpeaking(false);
                }
            };

            window.speechSynthesis.speak(
                utterance
            );
        },
        []
    );

    useEffect(() => {
        mountedRef.current = true;

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechSupported(false);

            return () => {
                mountedRef.current = false;
            };
        }

        const recognition =
            new SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            if (mountedRef.current) {
                setIsListening(true);
                setError("");
            }
        };

        recognition.onresult = (event) => {
            let finalText = "";
            let temporaryText = "";

            for (
                let index = event.resultIndex;
                index < event.results.length;
                index += 1
            ) {
                const spokenText =
                    event.results[index][0]
                        .transcript;

                if (
                    event.results[index].isFinal
                ) {
                    finalText += `${spokenText} `;
                } else {
                    temporaryText += spokenText;
                }
            }

            if (finalText) {
                setTranscript(
                    (previousText) =>
                        `${previousText} ${finalText}`
                            .replace(/\s+/g, " ")
                            .trim()
                );
            }

            setInterimTranscript(
                temporaryText
            );
        };

        recognition.onerror = (event) => {
            if (!mountedRef.current) {
                return;
            }

            setIsListening(false);
            setInterimTranscript("");

            if (
                event.error ===
                "not-allowed"
            ) {
                setError(
                    "Microphone permission was denied. Please allow microphone access in your browser."
                );
            } else if (
                event.error ===
                "no-speech"
            ) {
                setError(
                    "No speech was detected. Please try speaking again."
                );
            } else if (
                event.error !== "aborted"
            ) {
                setError(
                    "Unable to recognise your voice. Please try again."
                );
            }
        };

        recognition.onend = () => {
            if (mountedRef.current) {
                setIsListening(false);
                setInterimTranscript("");
            }
        };

        recognitionRef.current =
            recognition;

        return () => {
            mountedRef.current = false;

            try {
                recognition.abort();
            } catch {
                // Recognition may already be stopped.
            }

            window.speechSynthesis?.cancel();
        };
    }, []);

    useEffect(() => {
        if (
            screen === "INTERVIEW" &&
            currentQuestion?.question
        ) {
            const timer = window.setTimeout(
                () => {
                    speakText(
                        currentQuestion.question
                    );
                },
                450
            );

            return () => {
                window.clearTimeout(timer);
            };
        }

        return undefined;
    }, [
        currentQuestion?.question,
        screen,
        speakText,
    ]);

    const startInterview = async () => {
        if (!questionStyle) {
            setError(
                "Please select Static or Dynamic questions."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");
            setEvaluation(null);
            setTranscript("");
            setInterimTranscript("");

            const response = await api.post(
                "/virtual-interviews/start",
                {
                    materialId,
                    interviewType,
                    questionStyle,
                    difficulty,
                    questionCount:
                        Number(questionCount),
                }
            );

            const createdSession =
                response.data?.session;

            if (!createdSession?._id) {
                throw new Error(
                    "Virtual interview session was not created."
                );
            }

            setSession(createdSession);
            setScreen("INTERVIEW");
        } catch (requestError) {
            console.error(
                "Start virtual interview error:",
                requestError.response?.data ||
                requestError
            );

            setError(
                requestError.response?.data
                    ?.message ||
                requestError.message ||
                "Unable to start virtual interview."
            );
        } finally {
            setLoading(false);
        }
    };

    const startListening = () => {
        if (!speechSupported) {
            setError(
                "Speech recognition is not supported in this browser. Please use Chrome or Edge."
            );
            return;
        }

        if (!recognitionRef.current) {
            setError(
                "Microphone recognition is unavailable."
            );
            return;
        }

        stopSpeaking();
        setError("");
        setTranscript("");
        setInterimTranscript("");

        try {
            recognitionRef.current.start();
        } catch (recognitionError) {
            console.error(
                "Start recognition error:",
                recognitionError
            );

            setError(
                "Microphone is already active or unavailable."
            );
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) {
            return;
        }

        try {
            recognitionRef.current.stop();
        } catch {
            setIsListening(false);
        }
    };

    const clearAnswer = () => {
        if (isListening) {
            stopListening();
        }

        setTranscript("");
        setInterimTranscript("");
        setError("");
    };

    const submitAnswer = async () => {
        const finalTranscript =
            `${transcript} ${interimTranscript}`
                .replace(/\s+/g, " ")
                .trim();

        if (!finalTranscript) {
            setError(
                "Please record your answer before submitting."
            );
            return;
        }

        if (!session?._id) {
            setError(
                "Virtual interview session is missing."
            );
            return;
        }

        if (isListening) {
            stopListening();
        }

        try {
            setSubmitting(true);
            setError("");
            stopSpeaking();

            const response = await api.post(
                `/virtual-interviews/${session._id}/answer`,
                {
                    answerTranscript:
                        finalTranscript,
                }
            );

            const updatedSession =
                response.data?.session;

            const answerEvaluation =
                response.data?.evaluation;

            if (!updatedSession) {
                throw new Error(
                    "Updated interview session was not returned."
                );
            }

            setSession(updatedSession);
            setEvaluation(
                answerEvaluation || null
            );

            setTranscript("");
            setInterimTranscript("");

            if (response.data?.completed) {
                setScreen("RESULT");

                speakText(
                    `Your interview is complete. Your score is ${updatedSession.percentage} percent.`
                );
            } else {
                setScreen("FEEDBACK");

                const spokenFeedback =
                    answerEvaluation?.verdict ===
                        "Correct"
                        ? `${answerEvaluation.feedback}`
                        : `${answerEvaluation.feedback} The suggested answer is: ${answerEvaluation.idealAnswer}`;

                speakText(spokenFeedback);
            }
        } catch (requestError) {
            console.error(
                "Submit virtual answer error:",
                requestError.response?.data ||
                requestError
            );

            setError(
                requestError.response?.data
                    ?.message ||
                requestError.message ||
                "Unable to evaluate your answer."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const continueInterview = () => {
        stopSpeaking();
        setEvaluation(null);
        setTranscript("");
        setInterimTranscript("");
        setError("");
        setScreen("INTERVIEW");
    };

    const completeInterview = async () => {
        if (!session?._id) {
            return;
        }

        if (isListening) {
            stopListening();
        }

        try {
            setSubmitting(true);
            setError("");
            stopSpeaking();

            const response = await api.post(
                `/virtual-interviews/${session._id}/complete`
            );

            setSession(
                response.data?.session ||
                session
            );

            setScreen("RESULT");
        } catch (requestError) {
            setError(
                requestError.response?.data
                    ?.message ||
                "Unable to complete interview."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const repeatQuestion = () => {
        if (currentQuestion?.question) {
            speakText(
                currentQuestion.question
            );
        }
    };

    const restartInterview = () => {
        stopSpeaking();

        setSession(null);
        setEvaluation(null);
        setTranscript("");
        setInterimTranscript("");
        setQuestionStyle("");
        setError("");
        setScreen("SETUP");
    };

    const renderBackground = () => (
        <div
            className="virtual-background-art"
            aria-hidden="true"
        >
            <span className="virtual-orbit virtual-orbit-one" />
            <span className="virtual-orbit virtual-orbit-two" />

            <span className="virtual-floating-icon virtual-float-one">
                <Mic2 size={24} />
            </span>

            <span className="virtual-floating-icon virtual-float-two">
                <BrainCircuit size={24} />
            </span>

            <span className="virtual-floating-icon virtual-float-three">
                <GraduationCap size={25} />
            </span>

            <span className="virtual-floating-icon virtual-float-four">
                <MessageSquareText size={23} />
            </span>

            <span className="virtual-floating-icon virtual-float-five">
                <BookOpen size={23} />
            </span>
        </div>
    );

    if (screen === "INTERVIEW") {
        return (
            <div className="virtual-page">
                <Sidebar />
                {renderBackground()}

                <main className="virtual-content">
                    <div className="virtual-session-topbar">
                        <div>
                            <span>
                                Question{" "}
                                {
                                    session.currentQuestionNumber
                                }{" "}
                                of {session.questionCount}
                            </span>

                            <strong>
                                {session.questionStyle} interview
                            </strong>
                        </div>

                        <button
                            type="button"
                            onClick={completeInterview}
                            disabled={submitting}
                        >
                            <CircleStop size={17} />
                            End interview
                        </button>
                    </div>

                    <div
                        className="virtual-progress"
                        aria-label="Interview progress"
                    >
                        <span
                            style={{
                                width: `${(session.currentQuestionNumber /
                                        session.questionCount) *
                                    100
                                    }%`,
                            }}
                        />
                    </div>

                    <section className="virtual-question-card">
                        <div className="virtual-question-meta">
                            <span>
                                <BrainCircuit size={18} />
                                {currentQuestion?.topic ||
                                    "Interview question"}
                            </span>

                            <button
                                type="button"
                                onClick={repeatQuestion}
                                disabled={isSpeaking}
                            >
                                <Volume2 size={18} />
                                Repeat question
                            </button>
                        </div>

                        <h1>
                            {currentQuestion?.question ||
                                "Question unavailable"}
                        </h1>

                        <div
                            className={`virtual-microphone ${isListening
                                    ? "virtual-microphone-listening"
                                    : ""
                                }`}
                        >
                            <div className="virtual-microphone-rings">
                                <span />
                                <span />
                                <span />

                                <div>
                                    {isListening ? (
                                        <Radio size={34} />
                                    ) : (
                                        <Mic2 size={34} />
                                    )}
                                </div>
                            </div>

                            <strong>
                                {isListening
                                    ? "Listening..."
                                    : "Ready for your answer"}
                            </strong>

                            <p>
                                {isListening
                                    ? "Speak clearly. Your answer is being converted to text."
                                    : "Click the microphone and answer the question."}
                            </p>
                        </div>

                        <div className="virtual-transcript">
                            <div>
                                <span>Your answer</span>

                                {transcript && (
                                    <button
                                        type="button"
                                        onClick={clearAnswer}
                                    >
                                        <RotateCcw size={15} />
                                        Clear
                                    </button>
                                )}
                            </div>

                            <p>
                                {transcript ||
                                    interimTranscript ||
                                    "Your spoken answer will appear here..."}
                            </p>
                        </div>

                        {error && (
                            <div
                                className="virtual-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {!speechSupported && (
                            <div className="virtual-browser-warning">
                                Speech recognition is not
                                supported by this browser.
                                Please use Google Chrome or
                                Microsoft Edge.
                            </div>
                        )}

                        <div className="virtual-answer-actions">
                            {!isListening ? (
                                <button
                                    type="button"
                                    className="virtual-record-button"
                                    onClick={startListening}
                                    disabled={
                                        submitting ||
                                        !speechSupported
                                    }
                                >
                                    <Mic2 size={20} />
                                    Start answering
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="virtual-stop-button"
                                    onClick={stopListening}
                                >
                                    <Square size={18} />
                                    Stop recording
                                </button>
                            )}

                            <button
                                type="button"
                                className="virtual-submit-button"
                                onClick={submitAnswer}
                                disabled={
                                    submitting ||
                                    isListening ||
                                    !transcript.trim()
                                }
                            >
                                {submitting ? (
                                    <LoaderCircle
                                        className="spin-icon"
                                        size={19}
                                    />
                                ) : (
                                    <Sparkles size={19} />
                                )}

                                {submitting
                                    ? "Evaluating..."
                                    : "Submit answer"}
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    if (screen === "FEEDBACK") {
        return (
            <div className="virtual-page">
                <Sidebar />
                {renderBackground()}

                <main className="virtual-content virtual-feedback-content">
                    <section
                        className={`virtual-feedback-card virtual-feedback-${evaluation?.verdict
                            ?.toLowerCase()
                            .replace(" ", "-")}`}
                    >
                        <div className="virtual-feedback-heading">
                            <div>
                                {evaluation?.verdict ===
                                    "Correct" ? (
                                    <CheckCircle2 size={29} />
                                ) : (
                                    <BrainCircuit size={29} />
                                )}
                            </div>

                            <span>
                                Answer evaluation
                            </span>
                        </div>

                        <h1>
                            {evaluation?.verdict}
                        </h1>

                        <div className="virtual-score">
                            <strong>
                                {evaluation?.score || 0}
                            </strong>
                            <span>/10</span>
                        </div>

                        <p>
                            {evaluation?.feedback}
                        </p>

                        {evaluation?.verdict !==
                            "Correct" && (
                                <div className="virtual-ideal-answer">
                                    <span>
                                        Suggested answer
                                    </span>

                                    <p>
                                        {
                                            evaluation?.idealAnswer
                                        }
                                    </p>
                                </div>
                            )}

                        {error && (
                            <div
                                className="virtual-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="virtual-feedback-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    const feedbackText =
                                        evaluation?.verdict ===
                                            "Correct"
                                            ? evaluation?.feedback
                                            : `${evaluation?.feedback} The suggested answer is: ${evaluation?.idealAnswer}`;

                                    speakText(feedbackText);
                                }}
                                disabled={isSpeaking}
                            >
                                <Volume2 size={18} />
                                Hear feedback
                            </button>

                            <button
                                type="button"
                                className="virtual-next-button"
                                onClick={continueInterview}
                            >
                                Next question
                                <Play size={18} />
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    if (screen === "RESULT") {
        return (
            <div className="virtual-page">
                <Sidebar />
                {renderBackground()}

                <main className="virtual-content virtual-result-content">
                    <section className="virtual-result-card">
                        <div className="virtual-result-icon">
                            <Headphones size={32} />
                        </div>

                        <p>Interview completed</p>

                        <h1>Your performance</h1>

                        <div className="virtual-final-score">
                            <strong>
                                {session?.percentage || 0}%
                            </strong>

                            <span>
                                Average score:{" "}
                                {session?.averageScore || 0}
                                /10
                            </span>
                        </div>

                        <div className="virtual-result-stats">
                            <div>
                                <strong>
                                    {session?.totalAnswered ||
                                        0}
                                </strong>
                                <span>Answered</span>
                            </div>

                            <div>
                                <strong>
                                    {session?.correctAnswers ||
                                        0}
                                </strong>
                                <span>Correct</span>
                            </div>

                            <div>
                                <strong>
                                    {session
                                        ?.partiallyCorrectAnswers ||
                                        0}
                                </strong>
                                <span>Partial</span>
                            </div>

                            <div>
                                <strong>
                                    {session
                                        ?.incorrectAnswers ||
                                        0}
                                </strong>
                                <span>Incorrect</span>
                            </div>
                        </div>

                        {session?.overallStrengths
                            ?.length > 0 && (
                                <div className="virtual-summary-list">
                                    <h2>Strengths</h2>

                                    <ul>
                                        {session.overallStrengths.map(
                                            (item, index) => (
                                                <li key={index}>
                                                    {item}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        {session?.overallImprovements
                            ?.length > 0 && (
                                <div className="virtual-summary-list">
                                    <h2>
                                        Areas to improve
                                    </h2>

                                    <ul>
                                        {session.overallImprovements.map(
                                            (item, index) => (
                                                <li key={index}>
                                                    {item}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        <div className="virtual-result-actions">
                            <button
                                type="button"
                                onClick={restartInterview}
                            >
                                <RotateCcw size={18} />
                                Start another interview
                            </button>

                            <Link to="/materials">
                                Back to materials
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="virtual-page">
            <Sidebar />
            {renderBackground()}

            <main className="virtual-content">
                <Link
                    to={`/prepare/${materialId}`}
                    className="virtual-back"
                >
                    <ArrowLeft size={18} />
                    Preparation modes
                </Link>

                <header className="virtual-heading">
                    <div className="virtual-heading-icon">
                        <Mic2 size={28} />
                    </div>

                    <div>
                        <p>
                            AI-powered voice practice
                        </p>

                        <h1>Virtual Interview</h1>

                        <span>
                            Select how you want the AI
                            to conduct your voice interview.
                        </span>
                    </div>
                </header>

                {material && (
                    <section className="virtual-material">
                        <FileQuestion size={20} />

                        <div>
                            <small>
                                Interview material
                            </small>

                            <strong>
                                {material.title}
                            </strong>
                        </div>
                    </section>
                )}

                <section className="virtual-setup-card">
                    <div className="virtual-field">
                        <label htmlFor="virtual-type">
                            Interview type
                        </label>

                        <ThemeSelect
                            id="virtual-type"
                            value={interviewType}
                            onChange={setInterviewType}
                            ariaLabel="Select interview type"
                            options={interviewTypes}
                        />
                    </div>

                    <fieldset className="virtual-style-field">
                        <legend>Question style</legend>

                        <div className="virtual-style-options">
                            <button
                                type="button"
                                className={`virtual-style-option ${questionStyle === "STATIC"
                                        ? "virtual-style-option-selected"
                                        : ""
                                    }`}
                                aria-pressed={
                                    questionStyle === "STATIC"
                                }
                                onClick={() => {
                                    setQuestionStyle("STATIC");
                                    setError("");
                                }}
                            >
                                <BookOpen size={23} />

                                <span>
                                    <strong>
                                        Static questions
                                    </strong>

                                    <small>
                                        All questions are fixed
                                        when the interview starts.
                                    </small>
                                </span>
                            </button>

                            <button
                                type="button"
                                className={`virtual-style-option ${questionStyle === "DYNAMIC"
                                        ? "virtual-style-option-selected"
                                        : ""
                                    }`}
                                aria-pressed={
                                    questionStyle === "DYNAMIC"
                                }
                                onClick={() => {
                                    setQuestionStyle("DYNAMIC");
                                    setError("");
                                }}
                            >
                                <BrainCircuit size={23} />

                                <span>
                                    <strong>
                                        Dynamic questions
                                    </strong>

                                    <small>
                                        The next question changes
                                        according to your answer.
                                    </small>
                                </span>
                            </button>
                        </div>
                    </fieldset>

                    <div className="virtual-select-grid">
                        <div className="virtual-field">
                            <label htmlFor="virtual-difficulty">
                                Difficulty
                            </label>

                            <ThemeSelect
                                id="virtual-difficulty"
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

                        <div className="virtual-field">
                            <label htmlFor="virtual-count">
                                Questions
                            </label>

                            <ThemeSelect
                                id="virtual-count"
                                value={questionCount}
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
                    </div>

                    {error && (
                        <div
                            className="virtual-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        className="virtual-start-button"
                        disabled={
                            loading ||
                            !questionStyle
                        }
                        onClick={startInterview}
                    >
                        {loading ? (
                            <LoaderCircle
                                className="spin-icon"
                                size={20}
                            />
                        ) : (
                            <Radio size={20} />
                        )}

                        {loading
                            ? "Starting interview..."
                            : "Start virtual interview"}

                        {!loading && (
                            <Sparkles size={18} />
                        )}
                    </button>
                </section>
            </main>
        </div>
    );
};

export default VirtualInterview;