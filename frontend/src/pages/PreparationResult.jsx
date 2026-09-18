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
    CircleAlert,
    Database,
    FileQuestion,
    LoaderCircle,
    MessageSquareText,
    RefreshCw,
    Sparkles,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import api from "../services/api";

import "../styles/preparationResult.css";

const modeDetails = {
    MCQ: {
        title: "MCQ Result",
        icon: FileQuestion,
    },

    QUESTION_ANSWER: {
        title:
            "Question & Answer Result",
        icon: BookOpen,
    },

    INTERVIEW: {
        title:
            "Interview Preparation Result",
        icon: MessageSquareText,
    },
};

const ResultBackground = () => {
    return (
        <div
            className="result-background-art"
            aria-hidden="true"
        >
            <span className="result-orbit result-orbit-one" />
            <span className="result-orbit result-orbit-two" />
            <span className="result-orbit result-orbit-three" />

            <span className="result-floating-icon result-float-book">
                <BookOpen size={30} />
            </span>

            <span className="result-floating-icon result-float-brain">
                <BrainCircuit size={30} />
            </span>

            <span className="result-floating-icon result-float-question">
                <FileQuestion size={29} />
            </span>

            <span className="result-floating-icon result-float-chat">
                <MessageSquareText
                    size={29}
                />
            </span>

            <span className="result-floating-icon result-float-database">
                <Database size={27} />
            </span>

            <span className="result-floating-icon result-float-sparkle">
                <Sparkles size={26} />
            </span>
        </div>
    );
};

const getCorrectOption = (item) => {
    const options = Array.isArray(
        item?.options
    )
        ? item.options
        : [];

    const correctAnswer =
        item?.correctAnswer;

    if (
        typeof correctAnswer === "number"
    ) {
        return (
            options[correctAnswer] ||
            options[correctAnswer - 1] ||
            ""
        );
    }

    if (
        typeof correctAnswer !== "string"
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

    const matchingOption =
        options.find(
            (option) =>
                String(option)
                    .trim()
                    .toLowerCase() ===
                cleanedAnswer.toLowerCase()
        );

    return (
        matchingOption ||
        cleanedAnswer
    );
};

const PreparationResult = () => {
    const { preparationId } =
        useParams();

    const [
        preparation,
        setPreparation,
    ] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadPreparation =
        useCallback(async () => {
            if (!preparationId) {
                setError(
                    "Preparation ID is missing."
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await api.get(
                        `/preparations/${preparationId}`
                    );

                const preparationData =
                    response.data?.preparation ||
                    response.data?.data ||
                    response.data;

                if (
                    !preparationData?._id
                ) {
                    throw new Error(
                        "Preparation result was not found."
                    );
                }

                setPreparation(
                    preparationData
                );
            } catch (requestError) {
                console.error(
                    "Load preparation result error:",
                    requestError.response
                        ?.data ||
                    requestError
                );

                const status =
                    requestError.response
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
                        "This preparation result was not found."
                    );
                } else {
                    setError(
                        requestError.response
                            ?.data?.message ||
                        requestError.message ||
                        "Unable to load preparation result."
                    );
                }
            } finally {
                setLoading(false);
            }
        }, [preparationId]);

    useEffect(() => {
        loadPreparation();
    }, [loadPreparation]);

    const details = useMemo(() => {
        if (!preparation) {
            return modeDetails.MCQ;
        }

        return (
            modeDetails[
            preparation.mode
            ] || modeDetails.MCQ
        );
    }, [preparation]);

    if (loading) {
        return (
            <div className="result-page">
                <Sidebar />
                <ResultBackground />

                <main className="result-content result-state-content">
                    <section
                        className="result-status-card result-loading-card"
                        aria-live="polite"
                    >
                        <div className="result-status-icon result-loading-icon">
                            <LoaderCircle
                                className="spin-icon"
                                size={29}
                            />
                        </div>

                        <div className="result-status-copy">
                            <p className="result-status-label">
                                PrepMate AI
                            </p>

                            <h1>
                                Loading your result
                            </h1>

                            <span>
                                Please wait while we retrieve
                                your saved preparation.
                            </span>
                        </div>

                        <div
                            className="result-loading-line"
                            aria-hidden="true"
                        >
                            <span />
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    if (error || !preparation) {
        return (
            <div className="result-page">
                <Sidebar />
                <ResultBackground />

                <main className="result-content result-state-content">
                    <section
                        className="result-status-card result-error-card"
                        role="alert"
                    >
                        <div className="result-status-icon result-error-icon">
                            <CircleAlert size={29} />
                        </div>

                        <div className="result-status-copy">
                            <p className="result-status-label">
                                Result unavailable
                            </p>

                            <h1>
                                Unable to open result
                            </h1>

                            <span>
                                {error ||
                                    "Preparation result is unavailable."}
                            </span>
                        </div>

                        <div className="result-status-actions">
                            <button
                                type="button"
                                className="result-retry-button"
                                onClick={loadPreparation}
                            >
                                <RefreshCw size={17} />
                                Try again
                            </button>

                            <Link
                                to="/materials"
                                className="result-materials-button"
                            >
                                <ArrowLeft size={17} />
                                Back to materials
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    const Icon = details.icon;

    const isRAG =
        preparation.retrievalSystem ===
        "RAG";

    const isMultiAgent =
        preparation.generationSystem ===
        "MULTI_AGENT";

    const content = Array.isArray(
        preparation.content
    )
        ? preparation.content
        : [];

    const questionCount =
        preparation.questionCount ||
        content.length;

    const retrievalLabel = isRAG
        ? "RAG semantic search"
        : "Full-text fallback";

    const generationLabel =
        isMultiAgent
            ? "Multi-Agent AI"
            : "Single-Agent fallback";

    const provider =
        preparation.provider ||
        "Gemini";

    return (
        <div className="result-page">
            <Sidebar />
            <ResultBackground />

            <main className="result-content">
                <Link
                    to="/history"
                    className="result-back"
                >
                    <ArrowLeft size={18} />
                    History
                </Link>

                <header className="result-header">
                    <div className="result-header-icon">
                        <Icon size={27} />
                    </div>

                    <div>
                        <p>
                            Saved preparation
                        </p>

                        <h1>
                            {details.title}
                        </h1>

                        <span>
                            {preparation.material
                                ?.title ||
                                "Study material"}
                            {" · "}
                            {preparation.difficulty ||
                                "Medium"}
                            {" · "}
                            {questionCount} questions
                        </span>
                    </div>
                </header>

                <section
                    className="result-ai-details"
                    aria-label="AI generation details"
                >
                    <div className="result-ai-badge">
                        <Database size={17} />

                        <div>
                            <small>
                                Retrieval system
                            </small>

                            <strong>
                                {retrievalLabel}
                            </strong>
                        </div>
                    </div>

                    <div className="result-ai-badge">
                        <BrainCircuit
                            size={17}
                        />

                        <div>
                            <small>
                                Generation system
                            </small>

                            <strong>
                                {generationLabel}
                            </strong>
                        </div>
                    </div>

                    <div className="result-ai-badge">
                        <Sparkles size={17} />

                        <div>
                            <small>
                                Provider
                            </small>

                            <strong>
                                {provider}
                            </strong>
                        </div>
                    </div>
                </section>

                {isRAG &&
                    Array.isArray(
                        preparation.retrievedChunks
                    ) &&
                    preparation.retrievedChunks
                        .length > 0 && (
                        <details className="result-rag-sources">
                            <summary>
                                View RAG source chunks (
                                {
                                    preparation
                                        .retrievedChunks
                                        .length
                                }
                                )
                            </summary>

                            <div className="result-source-list">
                                {preparation.retrievedChunks.map(
                                    (chunk, index) => (
                                        <article
                                            key={
                                                chunk._id ||
                                                `${chunk.chunkIndex ??
                                                "chunk"
                                                }-${index}`
                                            }
                                            className="result-source"
                                        >
                                            <div>
                                                <strong>
                                                    Source{" "}
                                                    {index + 1}
                                                </strong>

                                                {Number.isFinite(
                                                    Number(
                                                        chunk.score
                                                    )
                                                ) && (
                                                        <span>
                                                            Similarity:{" "}
                                                            {Number(
                                                                chunk.score
                                                            ).toFixed(
                                                                3
                                                            )}
                                                        </span>
                                                    )}
                                            </div>

                                            <p>
                                                {chunk.content ||
                                                    "Source content unavailable."}
                                            </p>
                                        </article>
                                    )
                                )}
                            </div>
                        </details>
                    )}

                {content.length === 0 ? (
                    <div className="result-state">
                        <div>
                            <h2>
                                No result content
                            </h2>

                            <p>
                                No generated questions
                                were found in this
                                preparation.
                            </p>
                        </div>
                    </div>
                ) : (
                    <section className="result-list">
                        {content.map(
                            (item, index) => {
                                const correctOption =
                                    getCorrectOption(
                                        item
                                    );

                                return (
                                    <article
                                        key={
                                            item._id ||
                                            `result-${index}`
                                        }
                                        className="result-card"
                                    >
                                        <div className="result-question-number">
                                            Question{" "}
                                            {index + 1}
                                        </div>

                                        <h2>
                                            {item.question ||
                                                "Question unavailable"}
                                        </h2>

                                        {preparation.mode ===
                                            "MCQ" && (
                                                <>
                                                    <div className="result-options">
                                                        {item.options?.map(
                                                            (
                                                                option,
                                                                optionIndex
                                                            ) => {
                                                                const isCorrect =
                                                                    String(
                                                                        option
                                                                    )
                                                                        .trim()
                                                                        .toLowerCase() ===
                                                                    String(
                                                                        correctOption
                                                                    )
                                                                        .trim()
                                                                        .toLowerCase();

                                                                return (
                                                                    <div
                                                                        key={`${index}-${optionIndex}`}
                                                                        className={
                                                                            isCorrect
                                                                                ? "result-option result-option-correct"
                                                                                : "result-option"
                                                                        }
                                                                    >
                                                                        <span>
                                                                            {String.fromCharCode(
                                                                                65 +
                                                                                optionIndex
                                                                            )}
                                                                        </span>

                                                                        {option}

                                                                        {isCorrect && (
                                                                            <CheckCircle2
                                                                                size={17}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>

                                                    <div className="result-answer">
                                                        <strong>
                                                            Correct answer
                                                        </strong>

                                                        <p>
                                                            {correctOption ||
                                                                "Not provided"}
                                                        </p>

                                                        {item.explanation && (
                                                            <>
                                                                <strong>
                                                                    Explanation
                                                                </strong>

                                                                <p>
                                                                    {
                                                                        item.explanation
                                                                    }
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                        {preparation.mode ===
                                            "QUESTION_ANSWER" && (
                                                <div className="result-answer">
                                                    <strong>
                                                        Answer
                                                    </strong>

                                                    <p>
                                                        {item.answer ||
                                                            "Answer unavailable."}
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

                                        {preparation.mode ===
                                            "INTERVIEW" && (
                                                <div className="result-answer">
                                                    <strong>
                                                        Suggested answer
                                                    </strong>

                                                    <p>
                                                        {item.answer ||
                                                            "Suggested answer unavailable."}
                                                    </p>

                                                    {item.tip && (
                                                        <div className="result-tip">
                                                            <strong>
                                                                Tip:
                                                            </strong>{" "}
                                                            {item.tip}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                    </article>
                                );
                            }
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default PreparationResult;