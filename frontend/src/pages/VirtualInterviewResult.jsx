import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    BookOpen,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    FileQuestion,
    GraduationCap,
    Headphones,
    LoaderCircle,
    MessageSquareText,
    Mic2,
    RefreshCw,
    Sparkles,
    Volume2,
    XCircle,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import api from "../services/api";

import "../styles/virtualInterviewResult.css";


const interviewTypeLabels = {
    STUDY_VIVA:
        "Study Viva",

    RESUME_INTERVIEW:
        "Resume Interview",

    TECHNICAL_INTERVIEW:
        "Technical Interview",

    GENERAL_INTERVIEW:
        "General Interview",
};


const verdictIcons = {
    Correct:
        CheckCircle2,

    "Partially Correct":
        BrainCircuit,

    Incorrect:
        XCircle,

    Pending:
        Clock3,
};


const getVerdictClass = (
    verdict
) => {
    return String(
        verdict || "Pending"
    )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        );
};


const formatDate = (
    dateValue
) => {
    if (!dateValue) {
        return "Date unavailable";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    ).format(date);
};


const VirtualInterviewResult = () => {
    const { sessionId } =
        useParams();

    const [
        session,
        setSession,
    ] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [isSpeaking, setIsSpeaking] =
        useState(false);


    const loadSession =
        useCallback(async () => {
            if (!sessionId) {
                setError(
                    "Virtual interview session ID is missing."
                );

                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await api.get(
                        `/virtual-interviews/${sessionId}`
                    );

                const sessionData =
                    response.data
                        ?.session ||
                    response.data
                        ?.data ||
                    response.data;

                if (!sessionData?._id) {
                    throw new Error(
                        "Virtual interview result was not found."
                    );
                }

                setSession(
                    sessionData
                );
            } catch (
            requestError
            ) {
                console.error(
                    "Load virtual interview result error:",
                    requestError
                        .response
                        ?.data ||
                    requestError
                );

                const status =
                    requestError
                        .response
                        ?.status;

                if (
                    status === 401 ||
                    status === 403
                ) {
                    setError(
                        "Your login session has expired. Please login again."
                    );
                } else if (
                    status === 404
                ) {
                    setError(
                        "This virtual interview result was not found."
                    );
                } else {
                    setError(
                        requestError
                            .response
                            ?.data
                            ?.message ||
                        requestError
                            .message ||
                        "Unable to load virtual interview result."
                    );
                }
            } finally {
                setLoading(false);
            }
        }, [sessionId]);


    useEffect(() => {
        loadSession();

        return () => {
            if (
                typeof window !==
                "undefined" &&
                window.speechSynthesis
            ) {
                window
                    .speechSynthesis
                    .cancel();
            }
        };
    }, [loadSession]);


    const answeredQuestions =
        useMemo(() => {
            if (
                !Array.isArray(
                    session?.questions
                )
            ) {
                return [];
            }

            return session.questions.filter(
                (question) =>
                    question.verdict !==
                    "Pending"
            );
        }, [session]);


    const speakText = (
        text
    ) => {
        if (
            !text ||
            typeof window ===
            "undefined" ||
            !window.speechSynthesis
        ) {
            return;
        }

        window
            .speechSynthesis
            .cancel();

        const utterance =
            new SpeechSynthesisUtterance(
                text
            );

        utterance.lang =
            "en-IN";

        utterance.rate =
            0.92;

        utterance.pitch =
            1;

        utterance.volume =
            1;

        utterance.onstart =
            () => {
                setIsSpeaking(
                    true
                );
            };

        utterance.onend =
            () => {
                setIsSpeaking(
                    false
                );
            };

        utterance.onerror =
            () => {
                setIsSpeaking(
                    false
                );
            };

        window
            .speechSynthesis
            .speak(
                utterance
            );
    };


    const stopSpeaking = () => {
        window
            .speechSynthesis
            ?.cancel();

        setIsSpeaking(false);
    };


    const renderBackground =
        () => (
            <div
                className="virtual-result-background"
                aria-hidden="true"
            >
                <span className="virtual-result-orbit virtual-result-orbit-one" />
                <span className="virtual-result-orbit virtual-result-orbit-two" />

                <span className="virtual-result-floating-icon virtual-result-float-one">
                    <Mic2
                        size={25}
                    />
                </span>

                <span className="virtual-result-floating-icon virtual-result-float-two">
                    <BrainCircuit
                        size={25}
                    />
                </span>

                <span className="virtual-result-floating-icon virtual-result-float-three">
                    <GraduationCap
                        size={26}
                    />
                </span>

                <span className="virtual-result-floating-icon virtual-result-float-four">
                    <MessageSquareText
                        size={24}
                    />
                </span>

                <span className="virtual-result-floating-icon virtual-result-float-five">
                    <BookOpen
                        size={24}
                    />
                </span>
            </div>
        );


    if (loading) {
        return (
            <div className="virtual-result-page">
                <Sidebar />

                {renderBackground()}

                <main className="virtual-result-content">
                    <div className="virtual-result-state">
                        <LoaderCircle
                            className="spin-icon"
                            size={30}
                        />

                        <h2>
                            Loading interview result
                        </h2>

                        <p>
                            Please wait while we load
                            your virtual interview.
                        </p>
                    </div>
                </main>
            </div>
        );
    }


    if (
        error ||
        !session
    ) {
        return (
            <div className="virtual-result-page">
                <Sidebar />

                {renderBackground()}

                <main className="virtual-result-content">
                    <Link
                        to="/history"
                        className="virtual-result-back"
                    >
                        <ArrowLeft
                            size={18}
                        />

                        History
                    </Link>

                    <div className="virtual-result-state">
                        <XCircle
                            size={33}
                        />

                        <h2>
                            Unable to open result
                        </h2>

                        <p>
                            {error ||
                                "Virtual interview result is unavailable."}
                        </p>

                        <button
                            type="button"
                            onClick={
                                loadSession
                            }
                        >
                            <RefreshCw
                                size={17}
                            />

                            Try again
                        </button>
                    </div>
                </main>
            </div>
        );
    }


    const interviewType =
        interviewTypeLabels[
        session.interviewType
        ] ||
        "Study Viva";

    const statusClass =
        getVerdictClass(
            session.status
        );


    return (
        <div className="virtual-result-page">
            <Sidebar />

            {renderBackground()}

            <main className="virtual-result-content">
                <Link
                    to="/history"
                    className="virtual-result-back"
                >
                    <ArrowLeft
                        size={18}
                    />

                    History
                </Link>

                <header className="virtual-result-header">
                    <div className="virtual-result-header-icon">
                        <Headphones
                            size={30}
                        />
                    </div>

                    <div>
                        <p>
                            Virtual interview result
                        </p>

                        <h1>
                            {interviewType}
                        </h1>

                        <span>
                            {session.material
                                ?.title ||
                                "Study material"}
                        </span>
                    </div>

                    <span
                        className={`virtual-result-status virtual-result-status-${statusClass}`}
                    >
                        {session.status}
                    </span>
                </header>

                <section
                    className="virtual-result-information"
                    aria-label="Interview information"
                >
                    <article>
                        <span>
                            Question style
                        </span>

                        <strong>
                            {session.questionStyle ||
                                "STATIC"}
                        </strong>
                    </article>

                    <article>
                        <span>
                            Difficulty
                        </span>

                        <strong>
                            {session.difficulty ||
                                "Medium"}
                        </strong>
                    </article>

                    <article>
                        <span>
                            Questions
                        </span>

                        <strong>
                            {session.questionCount ||
                                session.questions
                                    ?.length ||
                                0}
                        </strong>
                    </article>

                    <article>
                        <span>
                            AI provider
                        </span>

                        <strong>
                            {session.provider ||
                                "Gemini"}
                        </strong>
                    </article>
                </section>

                <section className="virtual-result-score-card">
                    <div className="virtual-result-main-score">
                        <div>
                            <Sparkles
                                size={24}
                            />
                        </div>

                        <span>
                            Final score
                        </span>

                        <strong>
                            {session.percentage ||
                                0}
                            %
                        </strong>

                        <small>
                            Average{" "}
                            {session.averageScore ||
                                0}
                            /10
                        </small>
                    </div>

                    <div className="virtual-result-statistics">
                        <article>
                            <strong>
                                {session.totalAnswered ||
                                    0}
                            </strong>

                            <span>
                                Answered
                            </span>
                        </article>

                        <article className="virtual-stat-correct">
                            <strong>
                                {session.correctAnswers ||
                                    0}
                            </strong>

                            <span>
                                Correct
                            </span>
                        </article>

                        <article className="virtual-stat-partial">
                            <strong>
                                {session
                                    .partiallyCorrectAnswers ||
                                    0}
                            </strong>

                            <span>
                                Partial
                            </span>
                        </article>

                        <article className="virtual-stat-incorrect">
                            <strong>
                                {session.incorrectAnswers ||
                                    0}
                            </strong>

                            <span>
                                Incorrect
                            </span>
                        </article>
                    </div>
                </section>

                <section className="virtual-result-summary-grid">
                    <article className="virtual-result-summary-card">
                        <div>
                            <CheckCircle2
                                size={20}
                            />

                            <h2>
                                Strengths
                            </h2>
                        </div>

                        {session
                            .overallStrengths
                            ?.length > 0 ? (
                            <ul>
                                {session.overallStrengths.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <li
                                            key={`${item}-${index}`}
                                        >
                                            {item}
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p>
                                No strengths were
                                recorded.
                            </p>
                        )}
                    </article>

                    <article className="virtual-result-summary-card virtual-result-improvements">
                        <div>
                            <BrainCircuit
                                size={20}
                            />

                            <h2>
                                Areas to improve
                            </h2>
                        </div>

                        {session
                            .overallImprovements
                            ?.length > 0 ? (
                            <ul>
                                {session.overallImprovements.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <li
                                            key={`${item}-${index}`}
                                        >
                                            {item}
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p>
                                No improvement areas
                                were recorded.
                            </p>
                        )}
                    </article>
                </section>

                <div className="virtual-result-date">
                    <Clock3
                        size={16}
                    />

                    Started{" "}
                    {formatDate(
                        session.startedAt ||
                        session.createdAt
                    )}

                    {session.completedAt && (
                        <>
                            <span aria-hidden="true">
                                •
                            </span>

                            Completed{" "}
                            {formatDate(
                                session.completedAt
                            )}
                        </>
                    )}
                </div>

                <section className="virtual-result-question-list">
                    <div className="virtual-result-list-heading">
                        <div>
                            <FileQuestion
                                size={22}
                            />

                            <h2>
                                Answer review
                            </h2>
                        </div>

                        <span>
                            {
                                answeredQuestions.length
                            }{" "}
                            answered
                        </span>
                    </div>

                    {answeredQuestions.length ===
                        0 ? (
                        <div className="virtual-result-no-answers">
                            No answered questions were
                            found in this interview.
                        </div>
                    ) : (
                        answeredQuestions.map(
                            (
                                question,
                                index
                            ) => {
                                const verdict =
                                    question.verdict ||
                                    "Pending";

                                const verdictClass =
                                    getVerdictClass(
                                        verdict
                                    );

                                const VerdictIcon =
                                    verdictIcons[
                                    verdict
                                    ] ||
                                    Clock3;

                                return (
                                    <article
                                        key={
                                            question._id ||
                                            `virtual-question-${index}`
                                        }
                                        className="virtual-result-question-card"
                                    >
                                        <div className="virtual-result-question-top">
                                            <span>
                                                Question{" "}
                                                {question.questionNumber ||
                                                    index +
                                                    1}
                                            </span>

                                            <span
                                                className={`virtual-result-verdict virtual-result-verdict-${verdictClass}`}
                                            >
                                                <VerdictIcon
                                                    size={16}
                                                />

                                                {verdict}
                                            </span>
                                        </div>

                                        {question.topic && (
                                            <small className="virtual-result-topic">
                                                {
                                                    question.topic
                                                }
                                            </small>
                                        )}

                                        <h3>
                                            {question.question ||
                                                "Question unavailable"}
                                        </h3>

                                        <div className="virtual-result-question-score">
                                            <span>
                                                Score
                                            </span>

                                            <strong>
                                                {question.score ||
                                                    0}
                                                /10
                                            </strong>
                                        </div>

                                        <div className="virtual-result-answer-block">
                                            <strong>
                                                Your answer
                                            </strong>

                                            <p>
                                                {question.answerTranscript ||
                                                    "No answer transcript was recorded."}
                                            </p>
                                        </div>

                                        <div className="virtual-result-feedback-block">
                                            <div>
                                                <strong>
                                                    AI feedback
                                                </strong>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        isSpeaking
                                                            ? stopSpeaking()
                                                            : speakText(
                                                                `${question.feedback || ""} ${verdict !==
                                                                    "Correct" &&
                                                                    question.idealAnswer
                                                                    ? `The suggested answer is: ${question.idealAnswer}`
                                                                    : ""
                                                                }`
                                                            )
                                                    }
                                                >
                                                    <Volume2
                                                        size={16}
                                                    />

                                                    {isSpeaking
                                                        ? "Stop"
                                                        : "Listen"}
                                                </button>
                                            </div>

                                            <p>
                                                {question.feedback ||
                                                    "No feedback was provided."}
                                            </p>
                                        </div>

                                        {question.idealAnswer && (
                                            <div className="virtual-result-ideal-answer">
                                                <strong>
                                                    Suggested answer
                                                </strong>

                                                <p>
                                                    {
                                                        question.idealAnswer
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {(question
                                            .strengths
                                            ?.length >
                                            0 ||
                                            question
                                                .improvements
                                                ?.length >
                                            0) && (
                                                <div className="virtual-result-points">
                                                    {question
                                                        .strengths
                                                        ?.length >
                                                        0 && (
                                                            <div>
                                                                <strong>
                                                                    Strengths
                                                                </strong>

                                                                <ul>
                                                                    {question.strengths.map(
                                                                        (
                                                                            item,
                                                                            pointIndex
                                                                        ) => (
                                                                            <li
                                                                                key={`${item}-${pointIndex}`}
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}

                                                    {question
                                                        .improvements
                                                        ?.length >
                                                        0 && (
                                                            <div>
                                                                <strong>
                                                                    Improvements
                                                                </strong>

                                                                <ul>
                                                                    {question.improvements.map(
                                                                        (
                                                                            item,
                                                                            pointIndex
                                                                        ) => (
                                                                            <li
                                                                                key={`${item}-${pointIndex}`}
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                    </article>
                                );
                            }
                        )
                    )}
                </section>

                <div className="virtual-result-bottom-actions">
                    <Link
                        to={`/prepare/${session.material?._id}/virtual-interview`}
                        state={{
                            material:
                                session.material,

                            interviewType:
                                session.interviewType,

                            questionStyle:
                                session.questionStyle,

                            difficulty:
                                session.difficulty,

                            questionCount:
                                String(
                                    session.questionCount ||
                                    10
                                ),
                        }}
                    >
                        <RefreshCw
                            size={18}
                        />

                        Interview again
                    </Link>

                    <Link
                        to="/history"
                        className="virtual-result-history-link"
                    >
                        Back to history
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default VirtualInterviewResult;