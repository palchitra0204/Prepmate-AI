import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    Eye,
    FileQuestion,
    Headphones,
    History,
    LoaderCircle,
    MessageSquareText,
    Search,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

import "../styles/admin.css";


const modeInformation = {
    MCQ: {
        title: "MCQ Test",
        icon: FileQuestion,
    },

    QUESTION_ANSWER: {
        title: "Question & Answers",
        icon: BookOpen,
    },

    INTERVIEW: {
        title: "Interview Questions",
        icon: MessageSquareText,
    },

    VIRTUAL_INTERVIEW: {
        title: "Virtual Interview",
        icon: Headphones,
    },
};


const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    return new Date(
        date
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const AdminGenerations = () => {
    const [
        generations,
        setGenerations,
    ] = useState([]);

    const [search, setSearch] =
        useState("");

    const [
        modeFilter,
        setModeFilter,
    ] = useState("ALL");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [
        detailsGeneration,
        setDetailsGeneration,
    ] = useState(null);

    const [
        deleteGeneration,
        setDeleteGeneration,
    ] = useState(null);

    const [
        deletingGenerationId,
        setDeletingGenerationId,
    ] = useState("");


    /* =====================================================
       LOAD GENERATIONS
    ===================================================== */

    const loadGenerations = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get(
                    "/admin/generations"
                );

            setGenerations(
                response.data
                    ?.generations || []
            );
        } catch (requestError) {
            console.error(
                "Admin Generations Error:",
                requestError.response
                    ?.data ||
                requestError.message
            );

            setError(
                requestError.response
                    ?.data?.message ||
                "Unable to load AI generations"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadGenerations();
    }, []);


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(() => {
        if (
            !detailsGeneration &&
            !deleteGeneration
        ) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (
                event.key === "Escape" &&
                !deletingGenerationId
            ) {
                setDetailsGeneration(
                    null
                );

                setDeleteGeneration(
                    null
                );
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [
        detailsGeneration,
        deleteGeneration,
        deletingGenerationId,
    ]);


    /* =====================================================
       FILTER GENERATIONS
    ===================================================== */

    const filteredGenerations =
        useMemo(() => {
            const value = search
                .trim()
                .toLowerCase();

            return generations.filter(
                (item) => {
                    const matchesMode =
                        modeFilter ===
                        "ALL" ||
                        item.mode ===
                        modeFilter;

                    const searchable = [
                        item.mode,
                        item.interviewType,
                        item.questionStyle,
                        item.difficulty,
                        item.status,
                        item.material?.title,
                        item.user?.name,
                        item.user?.email,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return (
                        matchesMode &&
                        (
                            !value ||
                            searchable.includes(
                                value
                            )
                        )
                    );
                }
            );
        }, [
            generations,
            modeFilter,
            search,
        ]);


    /* =====================================================
       GENERATION INFORMATION
    ===================================================== */

    const getGenerationInformation = (
        item
    ) => {
        const information =
            modeInformation[item.mode] ||
            modeInformation.INTERVIEW;

        const contentCount =
            Array.isArray(item.content)
                ? item.content.length
                : item.questionCount ||
                0;

        let systemLabel =
            "Fallback";

        if (
            item.mode ===
            "VIRTUAL_INTERVIEW"
        ) {
            systemLabel =
                `${item.questionStyle ||
                "STATIC"} Voice`;
        } else if (
            item.generationSystem ===
            "MULTI_AGENT"
        ) {
            systemLabel =
                "Multi-Agent";
        }

        return {
            ...information,
            contentCount,
            systemLabel,
        };
    };


    /* =====================================================
       DELETE GENERATION
    ===================================================== */

    const handleDeleteGeneration =
        async () => {
            if (
                !deleteGeneration?._id ||
                !deleteGeneration
                    ?.generationType
            ) {
                return;
            }

            try {
                setDeletingGenerationId(
                    deleteGeneration._id
                );

                setError("");
                setSuccess("");

                const response =
                    await api.delete(
                        `/admin/generations/${deleteGeneration.generationType}/${deleteGeneration._id}`
                    );

                setGenerations(
                    (
                        previousGenerations
                    ) =>
                        previousGenerations.filter(
                            (item) =>
                                !(
                                    item._id ===
                                    deleteGeneration._id &&
                                    item.generationType ===
                                    deleteGeneration.generationType
                                )
                        )
                );

                setSuccess(
                    response.data
                        ?.message ||
                    "Generation deleted successfully"
                );

                setDeleteGeneration(
                    null
                );
            } catch (requestError) {
                console.error(
                    "Delete Generation Error:",
                    requestError.response
                        ?.data ||
                    requestError.message
                );

                setError(
                    requestError.response
                        ?.data?.message ||
                    "Unable to delete generation"
                );
            } finally {
                setDeletingGenerationId(
                    ""
                );
            }
        };


    return (
        <div className="admin-page">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-page-header">
                    <div>
                        <p className="admin-eyebrow">
                            AI ACTIVITY
                        </p>

                        <h1>
                            AI generations
                        </h1>

                        <span>
                            View and manage
                            preparation and virtual
                            interview activity.
                        </span>
                    </div>

                    <div className="admin-ai-status">
                        <Sparkles size={21} />

                        <div>
                            <span>
                                Total generations
                            </span>

                            <strong>
                                {
                                    generations.length
                                }
                            </strong>
                        </div>
                    </div>
                </header>


                <section className="admin-list-toolbar admin-generation-toolbar">
                    <div className="admin-search-box">
                        <Search size={19} />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(
                                    event.target.value
                                );

                                setError("");
                                setSuccess("");
                            }}
                            placeholder="Search generations..."
                            aria-label="Search generations"
                        />
                    </div>

                    <select
                        value={modeFilter}
                        onChange={(event) =>
                            setModeFilter(
                                event.target.value
                            )
                        }
                        className="admin-filter-select"
                        aria-label="Filter by mode"
                    >
                        <option value="ALL">
                            All modes
                        </option>

                        <option value="MCQ">
                            MCQs
                        </option>

                        <option value="QUESTION_ANSWER">
                            Question & Answers
                        </option>

                        <option value="INTERVIEW">
                            Interview Questions
                        </option>

                        <option value="VIRTUAL_INTERVIEW">
                            Virtual Interview
                        </option>
                    </select>
                </section>


                {success && (
                    <div
                        className="admin-success-message"
                        role="status"
                    >
                        <CheckCircle2
                            size={19}
                        />

                        <p>{success}</p>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                            aria-label="Close success message"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}


                {error && (
                    <div
                        className="admin-error"
                        role="alert"
                    >
                        <AlertTriangle
                            size={19}
                        />

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            aria-label="Close error message"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}


                {loading ? (
                    <div className="admin-loading">
                        <LoaderCircle
                            size={30}
                            className="admin-spin"
                        />

                        <p>
                            Loading AI
                            generations...
                        </p>
                    </div>
                ) : filteredGenerations
                    .length === 0 ? (
                    <div className="admin-data-card">
                        <div className="admin-empty-state">
                            <History
                                size={30}
                            />

                            <p>
                                No AI generations
                                found
                            </p>
                        </div>
                    </div>
                ) : (
                    <section className="admin-generation-grid">
                        {filteredGenerations.map(
                            (item) => {
                                const information =
                                    getGenerationInformation(
                                        item
                                    );

                                const ModeIcon =
                                    information.icon;

                                const isDeleting =
                                    deletingGenerationId ===
                                    item._id;

                                return (
                                    <article
                                        key={`${item.generationType}-${item._id}`}
                                        className="admin-generation-card"
                                    >
                                        <div className="admin-generation-card-top">
                                            <div className="admin-statistic-icon">
                                                <ModeIcon
                                                    size={
                                                        22
                                                    }
                                                />
                                            </div>

                                            <div className="admin-generation-badges">
                                                <span className="admin-role-badge">
                                                    {item.difficulty ||
                                                        "Medium"}
                                                </span>

                                                <span className="admin-generation-system-badge">
                                                    {
                                                        information.systemLabel
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <h2>
                                            {
                                                information.title
                                            }
                                        </h2>

                                        <p>
                                            {item
                                                .material
                                                ?.title ||
                                                "Study material"}
                                        </p>

                                        <div className="admin-generation-owner">
                                            <strong>
                                                {item
                                                    .user
                                                    ?.name ||
                                                    "Unknown user"}
                                            </strong>

                                            <span>
                                                {item
                                                    .user
                                                    ?.email ||
                                                    "Email unavailable"}
                                            </span>
                                        </div>

                                        <div className="admin-generation-meta">
                                            <span>
                                                {
                                                    information.contentCount
                                                }{" "}
                                                questions
                                            </span>

                                            <span>
                                                {item.status ||
                                                    "—"}
                                            </span>

                                            <time>
                                                {formatDate(
                                                    item.createdAt
                                                )}
                                            </time>
                                        </div>

                                        <div className="admin-generation-actions">
                                            <button
                                                type="button"
                                                className="admin-generation-view-button"
                                                onClick={() =>
                                                    setDetailsGeneration(
                                                        item
                                                    )
                                                }
                                            >
                                                <Eye
                                                    size={
                                                        17
                                                    }
                                                />

                                                View details
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-delete-user-button"
                                                disabled={
                                                    isDeleting
                                                }
                                                onClick={() =>
                                                    setDeleteGeneration(
                                                        item
                                                    )
                                                }
                                            >
                                                {isDeleting ? (
                                                    <LoaderCircle
                                                        size={
                                                            17
                                                        }
                                                        className="admin-spin"
                                                    />
                                                ) : (
                                                    <Trash2
                                                        size={
                                                            17
                                                        }
                                                    />
                                                )}

                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </section>
                )}
            </main>


            {detailsGeneration && (
                <div
                    className="admin-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setDetailsGeneration(
                                null
                            );
                        }
                    }}
                >
                    <section
                        className="admin-generation-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="generation-details-title"
                    >
                        <button
                            type="button"
                            className="admin-modal-close"
                            onClick={() =>
                                setDetailsGeneration(
                                    null
                                )
                            }
                            aria-label="Close generation details"
                        >
                            <X size={20} />
                        </button>

                        <div className="admin-generation-details-icon">
                            {(() => {
                                const DetailIcon =
                                    getGenerationInformation(
                                        detailsGeneration
                                    ).icon;

                                return (
                                    <DetailIcon
                                        size={27}
                                    />
                                );
                            })()}
                        </div>

                        <h2 id="generation-details-title">
                            {
                                getGenerationInformation(
                                    detailsGeneration
                                ).title
                            }
                        </h2>

                        <p>
                            {detailsGeneration
                                .material?.title ||
                                "Study material"}
                        </p>

                        <div className="admin-generation-details-grid">
                            <div>
                                <span>User</span>

                                <strong>
                                    {detailsGeneration
                                        .user?.name ||
                                        "Unknown user"}
                                </strong>
                            </div>

                            <div>
                                <span>Email</span>

                                <strong>
                                    {detailsGeneration
                                        .user?.email ||
                                        "Unavailable"}
                                </strong>
                            </div>

                            <div>
                                <span>Difficulty</span>

                                <strong>
                                    {detailsGeneration.difficulty ||
                                        "Medium"}
                                </strong>
                            </div>

                            <div>
                                <span>Status</span>

                                <strong>
                                    {detailsGeneration.status ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Questions</span>

                                <strong>
                                    {
                                        getGenerationInformation(
                                            detailsGeneration
                                        ).contentCount
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Created</span>

                                <strong>
                                    {formatDate(
                                        detailsGeneration.createdAt
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>System</span>

                                <strong>
                                    {
                                        getGenerationInformation(
                                            detailsGeneration
                                        ).systemLabel
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Mode</span>

                                <strong>
                                    {detailsGeneration.mode ||
                                        "—"}
                                </strong>
                            </div>
                        </div>
                    </section>
                </div>
            )}


            {deleteGeneration && (
                <div
                    className="admin-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget &&
                            !deletingGenerationId
                        ) {
                            setDeleteGeneration(
                                null
                            );
                        }
                    }}
                >
                    <section
                        className="admin-confirm-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-generation-title"
                    >
                        <button
                            type="button"
                            className="admin-modal-close"
                            onClick={() =>
                                setDeleteGeneration(
                                    null
                                )
                            }
                            disabled={
                                Boolean(
                                    deletingGenerationId
                                )
                            }
                            aria-label="Close confirmation"
                        >
                            <X size={20} />
                        </button>

                        <div className="admin-confirm-icon">
                            <AlertTriangle
                                size={28}
                            />
                        </div>

                        <h2 id="delete-generation-title">
                            Delete generation?
                        </h2>

                        <p>
                            Are you sure you want
                            to delete this{" "}
                            <strong>
                                {
                                    getGenerationInformation(
                                        deleteGeneration
                                    ).title
                                }
                            </strong>
                            ?
                        </p>

                        <span className="admin-delete-warning">
                            This generated result will
                            be permanently deleted.
                            The original study material
                            will not be deleted.
                        </span>

                        <div className="admin-confirm-actions">
                            <button
                                type="button"
                                className="admin-cancel-button"
                                onClick={() =>
                                    setDeleteGeneration(
                                        null
                                    )
                                }
                                disabled={
                                    Boolean(
                                        deletingGenerationId
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="admin-confirm-delete-button"
                                onClick={
                                    handleDeleteGeneration
                                }
                                disabled={
                                    Boolean(
                                        deletingGenerationId
                                    )
                                }
                            >
                                {deletingGenerationId ? (
                                    <LoaderCircle
                                        size={18}
                                        className="admin-spin"
                                    />
                                ) : (
                                    <Trash2
                                        size={18}
                                    />
                                )}

                                {deletingGenerationId
                                    ? "Deleting..."
                                    : "Delete generation"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};


export default AdminGenerations;