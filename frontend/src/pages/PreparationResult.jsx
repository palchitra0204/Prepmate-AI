import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    BookOpen,
    BrainCircuit,
    CheckCircle2,
    Database,
    FileQuestion,
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

const PreparationResult = () => {
    const { preparationId } =
        useParams();

    const [preparation, setPreparation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadPreparation =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const response = await api.get(
                        `/preparations/${preparationId}`
                    );

                    setPreparation(
                        response.data.preparation
                    );
                } catch (requestError) {
                    setError(
                        requestError.response
                            ?.data?.message ||
                        "Unable to load preparation result"
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadPreparation();
    }, [preparationId]);

    if (loading) {
        return (
            <div className="result-page">
                <Sidebar />

                <main className="result-content">
                    <div className="result-state">
                        <LoaderCircle
                            className="spin-icon"
                            size={28}
                        />

                        Loading preparation result...
                    </div>
                </main>
            </div>
        );
    }

    if (error || !preparation) {
        return (
            <div className="result-page">
                <Sidebar />

                <main className="result-content">
                    <Link
                        to="/history"
                        className="result-back"
                    >
                        <ArrowLeft size={18} />
                        History
                    </Link>

                    <div className="result-state">
                        <div>
                            <h2>
                                Unable to open result
                            </h2>
                            <p>{error}</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const details =
        modeDetails[preparation.mode] ||
        modeDetails.MCQ;

    const Icon = details.icon;

    const isRAG =
        preparation.retrievalSystem ===
        "RAG";

    const isMultiAgent =
        preparation.generationSystem ===
        "MULTI_AGENT";

    return (
        <div className="result-page">
            <Sidebar />

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
                        <p>Saved preparation</p>

                        <h1>{details.title}</h1>

                        <span>
                            {preparation.material
                                ?.title ||
                                "Study material"}{" "}
                            · {preparation.difficulty} ·{" "}
                            {preparation.questionCount}{" "}
                            questions
                        </span>
                    </div>
                </header>

                <section className="result-ai-details">
                    <div className="result-ai-badge">
                        <Database size={17} />

                        <div>
                            <small>
                                Retrieval system
                            </small>

                            <strong>
                                {isRAG
                                    ? "RAG semantic search"
                                    : "Full-text fallback"}
                            </strong>
                        </div>
                    </div>

                    <div className="result-ai-badge">
                        <BrainCircuit size={17} />

                        <div>
                            <small>
                                Generation system
                            </small>

                            <strong>
                                {isMultiAgent
                                    ? "Multi-Agent AI"
                                    : "Single-Agent fallback"}
                            </strong>
                        </div>
                    </div>

                    <div className="result-ai-badge">
                        <Sparkles size={17} />

                        <div>
                            <small>Provider</small>

                            <strong>
                                {preparation.provider ||
                                    "Gemini"}
                            </strong>
                        </div>
                    </div>
                </section>

                {isRAG &&
                    preparation.retrievedChunks
                        ?.length > 0 && (
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
                                                `${chunk.chunkIndex}-${index}`
                                            }
                                            className="result-source"
                                        >
                                            <div>
                                                <strong>
                                                    Source {index + 1}
                                                </strong>

                                                <span>
                                                    Similarity:{" "}
                                                    {Number(
                                                        chunk.score || 0
                                                    ).toFixed(3)}
                                                </span>
                                            </div>

                                            <p>{chunk.content}</p>
                                        </article>
                                    )
                                )}
                            </div>
                        </details>
                    )}

                <section className="result-list">
                    {preparation.content?.map(
                        (item, index) => (
                            <article
                                key={index}
                                className="result-card"
                            >
                                <div className="result-question-number">
                                    Question {index + 1}
                                </div>

                                <h2>{item.question}</h2>

                                {preparation.mode ===
                                    "MCQ" && (
                                        <>
                                            <div className="result-options">
                                                {item.options?.map(
                                                    (
                                                        option,
                                                        optionIndex
                                                    ) => (
                                                        <div
                                                            key={
                                                                optionIndex
                                                            }
                                                            className={
                                                                option ===
                                                                    item.correctAnswer
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

                                                            {option ===
                                                                item.correctAnswer && (
                                                                    <CheckCircle2
                                                                        size={17}
                                                                    />
                                                                )}
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            <div className="result-answer">
                                                <strong>
                                                    Correct answer
                                                </strong>

                                                <p>
                                                    {item.correctAnswer}
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

                                            <p>{item.answer}</p>

                                            {item.explanation && (
                                                <small>
                                                    {item.explanation}
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

                                            <p>{item.answer}</p>

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
                        )
                    )}
                </section>
            </main>
        </div>
    );
};

export default PreparationResult;