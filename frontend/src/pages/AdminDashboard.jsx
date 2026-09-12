import {
    AlertCircle,
    BookOpen,
    BrainCircuit,
    CheckCircle2,
    FileQuestion,
    FileText,
    LoaderCircle,
    MessageSquareText,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

import "../styles/admin.css";

const AdminDashboard = () => {
    const [
        dashboardData,
        setDashboardData,
    ] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadDashboard =
        useCallback(async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/admin/dashboard"
                );

                setDashboardData(
                    response.data
                );
            } catch (requestError) {
                console.error(
                    "Admin Dashboard Error:",
                    requestError.response?.data ||
                    requestError.message
                );

                setError(
                    requestError.response?.data
                        ?.message ||
                    "Unable to load admin dashboard"
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    if (loading) {
        return (
            <div className="admin-page">
                <AdminSidebar />

                <main className="admin-main">
                    <div className="admin-loading">
                        <LoaderCircle
                            size={30}
                            className="admin-spin"
                        />

                        <p>
                            Loading admin dashboard...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    const statistics =
        dashboardData?.statistics || {};

    const aiSystem =
        dashboardData?.aiSystem || {};

    const statisticCards = [
        {
            title: "Total Users",
            value:
                statistics.totalUsers || 0,
            description:
                "Registered accounts",
            icon: Users,
        },
        {
            title: "Study Materials",
            value:
                statistics.totalMaterials || 0,
            description:
                "Uploaded documents",
            icon: FileText,
        },
        {
            title: "AI Generations",
            value:
                statistics.totalPreparations ||
                0,
            description:
                "All generated results",
            icon: Sparkles,
        },
        {
            title: "Multi-Agent",
            value:
                statistics.totalMultiAgent ||
                0,
            description:
                `${statistics.multiAgentRate || 0}% of generations`,
            icon: BrainCircuit,
        },
        {
            title: "MCQ Tests",
            value:
                statistics.totalMCQs || 0,
            description:
                "Generated MCQ sets",
            icon: FileQuestion,
        },
        {
            title: "Question & Answers",
            value:
                statistics.totalQuestionAnswers ||
                0,
            description:
                "Generated study sets",
            icon: BookOpen,
        },
        {
            title: "Interview Questions",
            value:
                statistics.totalInterviews ||
                0,
            description:
                "Generated viva sets",
            icon: MessageSquareText,
        },
        {
            title: "AI Fallback",
            value:
                statistics.totalFallback || 0,
            description:
                "Fallback generations",
            icon: RefreshCw,
        },
    ];

    return (
        <div className="admin-page">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-page-header">
                    <div>
                        <p className="admin-eyebrow">
                            ADMINISTRATION
                        </p>

                        <h1>
                            Dashboard overview
                        </h1>

                        <span>
                            Monitor users, materials and
                            Multi-Agent AI activity.
                        </span>
                    </div>

                    <div className="admin-ai-status">
                        <BrainCircuit size={21} />

                        <div>
                            <span>AI system</span>

                            <strong>
                                Multi-Agent Active
                            </strong>
                        </div>
                    </div>
                </header>

                {error && (
                    <section className="admin-error">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={loadDashboard}
                        >
                            Try again
                        </button>
                    </section>
                )}

                {!error && (
                    <>
                        <section className="admin-statistics-grid admin-statistics-grid-four">
                            {statisticCards.map(
                                (card) => {
                                    const Icon =
                                        card.icon;

                                    return (
                                        <article
                                            key={card.title}
                                            className="admin-statistic-card"
                                        >
                                            <div className="admin-statistic-icon">
                                                <Icon size={23} />
                                            </div>

                                            <div>
                                                <p>
                                                    {card.title}
                                                </p>

                                                <h2>
                                                    {card.value}
                                                </h2>

                                                <span>
                                                    {card.description}
                                                </span>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </section>

                        <section className="admin-ai-overview">
                            <article className="admin-ai-system-card">
                                <header className="admin-data-card-header">
                                    <div>
                                        <h2>
                                            Multi-Agent AI System
                                        </h2>

                                        <p>
                                            Current AI configuration
                                            and agent status
                                        </p>
                                    </div>

                                    <span className="admin-system-active">
                                        <CheckCircle2
                                            size={15}
                                        />

                                        Active
                                    </span>
                                </header>

                                <div className="admin-ai-system-information">
                                    <div className="admin-ai-system-details">
                                        <div>
                                            <span>
                                                AI provider
                                            </span>

                                            <strong>
                                                {aiSystem.provider ||
                                                    "Gemini"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                AI model
                                            </span>

                                            <strong>
                                                {aiSystem.model ||
                                                    "Not configured"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Generation system
                                            </span>

                                            <strong>
                                                Multi-Agent
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Fallback
                                            </span>

                                            <strong>
                                                {aiSystem.fallbackEnabled
                                                    ? "Enabled"
                                                    : "Disabled"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="admin-agent-list">
                                        <p>Available agents</p>

                                        <div>
                                            {aiSystem.agents?.map(
                                                (agent) => (
                                                    <span key={agent}>
                                                        <BrainCircuit
                                                            size={13}
                                                        />

                                                        {agent}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <article className="admin-performance-card">
                                <header>
                                    <ShieldCheck size={22} />

                                    <div>
                                        <h2>
                                            AI performance
                                        </h2>

                                        <p>
                                            Generation completion
                                            overview
                                        </p>
                                    </div>
                                </header>

                                <div className="admin-performance-score">
                                    <strong>
                                        {statistics.completionRate ||
                                            0}
                                        %
                                    </strong>

                                    <span>
                                        Completion rate
                                    </span>
                                </div>

                                <div className="admin-performance-details">
                                    <div>
                                        <CheckCircle2
                                            size={17}
                                        />

                                        <span>
                                            Completed
                                        </span>

                                        <strong>
                                            {statistics.totalCompleted ||
                                                0}
                                        </strong>
                                    </div>

                                    <div>
                                        <AlertCircle
                                            size={17}
                                        />

                                        <span>Failed</span>

                                        <strong>
                                            {statistics.totalFailed ||
                                                0}
                                        </strong>
                                    </div>
                                </div>
                            </article>
                        </section>

                        <section className="admin-dashboard-sections">
                            <article className="admin-data-card">
                                <header className="admin-data-card-header">
                                    <div>
                                        <h2>
                                            Recent AI activity
                                        </h2>

                                        <p>
                                            Latest preparation
                                            generations
                                        </p>
                                    </div>
                                </header>

                                {dashboardData
                                    ?.recentPreparations
                                    ?.length > 0 ? (
                                    <div className="admin-activity-list">
                                        {dashboardData.recentPreparations.map(
                                            (preparation) => (
                                                <div
                                                    key={
                                                        preparation._id
                                                    }
                                                    className="admin-activity-item"
                                                >
                                                    <div className="admin-material-icon">
                                                        {preparation.mode ===
                                                            "MCQ" ? (
                                                            <FileQuestion
                                                                size={19}
                                                            />
                                                        ) : preparation.mode ===
                                                            "QUESTION_ANSWER" ? (
                                                            <BookOpen
                                                                size={19}
                                                            />
                                                        ) : (
                                                            <MessageSquareText
                                                                size={19}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="admin-activity-details">
                                                        <strong>
                                                            {preparation
                                                                .material
                                                                ?.title ||
                                                                "Study material"}
                                                        </strong>

                                                        <span>
                                                            {preparation.mode} ·{" "}
                                                            {
                                                                preparation.difficulty
                                                            }{" "}
                                                            ·{" "}
                                                            {
                                                                preparation.questionCount
                                                            }{" "}
                                                            questions
                                                        </span>
                                                    </div>

                                                    <div className="admin-activity-status">
                                                        <span
                                                            className={
                                                                preparation.generationSystem ===
                                                                    "MULTI_AGENT"
                                                                    ? "admin-generation-system-badge"
                                                                    : "admin-generation-system-badge admin-generation-system-fallback"
                                                            }
                                                        >
                                                            {preparation.generationSystem ===
                                                                "MULTI_AGENT"
                                                                ? "Multi-Agent"
                                                                : "Fallback"}
                                                        </span>

                                                        <time>
                                                            {preparation.createdAt
                                                                ? new Date(
                                                                    preparation.createdAt
                                                                ).toLocaleDateString(
                                                                    "en-IN"
                                                                )
                                                                : "—"}
                                                        </time>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="admin-empty-state">
                                        <BrainCircuit
                                            size={28}
                                        />

                                        <p>
                                            No AI activity found
                                        </p>
                                    </div>
                                )}
                            </article>

                            <article className="admin-data-card">
                                <header className="admin-data-card-header">
                                    <div>
                                        <h2>
                                            Recent users
                                        </h2>

                                        <p>
                                            Latest registered
                                            accounts
                                        </p>
                                    </div>
                                </header>

                                {dashboardData
                                    ?.recentUsers?.length >
                                    0 ? (
                                    <div className="admin-table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Role</th>
                                                    <th>
                                                        Registered
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {dashboardData.recentUsers.map(
                                                    (user) => (
                                                        <tr
                                                            key={
                                                                user._id
                                                            }
                                                        >
                                                            <td>
                                                                <div className="admin-user-cell">
                                                                    <div className="admin-small-avatar">
                                                                        {user.name
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase() ||
                                                                            "U"}
                                                                    </div>

                                                                    <div>
                                                                        <strong>
                                                                            {
                                                                                user.name
                                                                            }
                                                                        </strong>

                                                                        <span>
                                                                            {
                                                                                user.email
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span className="admin-role-badge">
                                                                    {
                                                                        user.role
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {user.createdAt
                                                                    ? new Date(
                                                                        user.createdAt
                                                                    ).toLocaleDateString(
                                                                        "en-IN"
                                                                    )
                                                                    : "—"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="admin-empty-state">
                                        <Users size={28} />

                                        <p>
                                            No users found
                                        </p>
                                    </div>
                                )}
                            </article>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;