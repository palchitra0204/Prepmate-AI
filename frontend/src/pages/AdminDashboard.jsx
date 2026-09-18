import {
    AlertCircle,
    BookOpen,
    BrainCircuit,
    CheckCircle2,
    FileQuestion,
    FileText,
    Headphones,
    LoaderCircle,
    MessageSquareText,
    RefreshCw,
    Sparkles,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";
import "../styles/admin.css";

const modeIcon = (mode) => {
    if (mode === "MCQ") return FileQuestion;
    if (mode === "QUESTION_ANSWER") return BookOpen;
    if (mode === "VIRTUAL_INTERVIEW") return Headphones;
    return MessageSquareText;
};

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/admin/dashboard");
            setDashboardData(response.data);
        } catch (requestError) {
            console.error("Admin Dashboard Error:", requestError.response?.data || requestError.message);
            setError(requestError.response?.data?.message || "Unable to load admin dashboard");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const statistics = dashboardData?.statistics || {};
    const aiSystem = dashboardData?.aiSystem || {};

    const generationUsage = useMemo(() => {
        const values = [
            { label: "MCQ", value: statistics.totalMCQs || 0, color: "purple" },
            { label: "Q&A", value: statistics.totalQuestionAnswers || 0, color: "pink" },
            { label: "Interview", value: statistics.totalInterviews || 0, color: "maroon" },
            { label: "Virtual", value: statistics.totalVirtualInterviews || 0, color: "violet" },
        ];
        const maximum = Math.max(...values.map((item) => item.value), 1);
        return values.map((item) => ({ ...item, width: `${Math.max((item.value / maximum) * 100, item.value ? 8 : 0)}%` }));
    }, [statistics]);

    const totalStyles =
        (statistics.staticVirtualInterviews || 0) +
        (statistics.dynamicVirtualInterviews || 0);
    const staticPercentage = totalStyles
        ? Math.round(((statistics.staticVirtualInterviews || 0) / totalStyles) * 100)
        : 50;

    const recentActivity = [
        ...(dashboardData?.recentPreparations || []).map((item) => ({ ...item, activityType: "PREPARATION" })),
        ...(dashboardData?.recentVirtualInterviews || []).map((item) => ({ ...item, mode: "VIRTUAL_INTERVIEW", activityType: "VIRTUAL_INTERVIEW" })),
    ]
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
        .slice(0, 6);

    if (loading) {
        return <div className="admin-page"><AdminSidebar /><main className="admin-main"><div className="admin-loading"><LoaderCircle size={30} className="admin-spin" /><p>Loading admin dashboard...</p></div></main></div>;
    }

    const cards = [
        { title: "Total Users", value: statistics.totalUsers || 0, detail: `${statistics.totalStudents || 0} students`, icon: Users, tone: "purple" },
        { title: "Study Materials", value: statistics.totalMaterials || 0, detail: "Uploaded documents", icon: FileText, tone: "pink" },
        { title: "AI Generations", value: statistics.totalGenerations ?? statistics.totalPreparations ?? 0, detail: `${statistics.completionRate || 0}% completed`, icon: Sparkles, tone: "maroon" },
        { title: "Virtual Interviews", value: statistics.totalVirtualInterviews || 0, detail: `${statistics.activeVirtualInterviews || 0} currently active`, icon: Headphones, tone: "gradient" },
    ];

    return (
        <div className="admin-page admin-dashboard-page">
            <AdminSidebar />
            <main className="admin-main">
                <header className="admin-page-header admin-dashboard-header">
                    <div><p className="admin-eyebrow">ADMINISTRATION</p><h1>Dashboard overview</h1><span>Monitor users, materials, AI generations and virtual interviews.</span></div>
                    <button type="button" className="admin-dashboard-refresh" onClick={loadDashboard}><RefreshCw size={18} />Refresh</button>
                </header>

                {error ? <section className="admin-error"><p>{error}</p><button type="button" onClick={loadDashboard}>Try again</button></section> : <>
                    <section className="admin-overview-grid">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return <article key={card.title} className={`admin-overview-card admin-overview-${card.tone}`}>
                                <div className="admin-overview-card-glow" />
                                <div className="admin-overview-icon"><Icon size={23} /></div>
                                <p>{card.title}</p><h2>{card.value}</h2><span>{card.detail}</span>
                            </article>;
                        })}
                    </section>

                    <section className="admin-analytics-grid">
                        <article className="admin-dashboard-panel admin-usage-panel">
                            <header><div><h2>Generation activity</h2><p>Usage across all preparation modes</p></div><Sparkles size={21} /></header>
                            <div className="admin-usage-chart">
                                {generationUsage.map((item) => <div className="admin-usage-row" key={item.label}>
                                    <div><span>{item.label}</span><strong>{item.value}</strong></div>
                                    <div className="admin-usage-track"><span className={`admin-usage-${item.color}`} style={{ width: item.width }} /></div>
                                </div>)}
                            </div>
                        </article>

                        <article className="admin-dashboard-panel admin-interview-panel">
                            <header><div><h2>Interview styles</h2><p>Static and dynamic distribution</p></div><Headphones size={21} /></header>
                            <div className="admin-interview-chart-wrap">
                                <div className="admin-interview-donut" style={{ "--static-percentage": `${staticPercentage}%` }}><div><strong>{totalStyles}</strong><span>Total</span></div></div>
                                <div className="admin-chart-legend">
                                    <div><i className="admin-legend-static" /><span>Static</span><strong>{statistics.staticVirtualInterviews || 0}</strong></div>
                                    <div><i className="admin-legend-dynamic" /><span>Dynamic</span><strong>{statistics.dynamicVirtualInterviews || 0}</strong></div>
                                </div>
                            </div>
                        </article>

                        <article className="admin-dashboard-panel admin-health-panel">
                            <header><div><h2>AI performance</h2><p>Generation health overview</p></div><BrainCircuit size={21} /></header>
                            <div className="admin-health-score"><strong>{statistics.completionRate || 0}%</strong><span>Completion rate</span></div>
                            <div className="admin-health-items">
                                <div><CheckCircle2 size={17} /><span>Completed</span><strong>{statistics.totalCompleted || 0}</strong></div>
                                <div><AlertCircle size={17} /><span>Failed</span><strong>{statistics.totalFailed || 0}</strong></div>
                                <div><BrainCircuit size={17} /><span>Multi-Agent</span><strong>{statistics.totalMultiAgent || 0}</strong></div>
                            </div>
                        </article>
                    </section>

                    <section className="admin-dashboard-bottom-grid">
                        <article className="admin-dashboard-panel">
                            <header><div><h2>Recent AI activity</h2><p>Latest preparation and interview sessions</p></div></header>
                            {recentActivity.length ? <div className="admin-activity-list">{recentActivity.map((item) => {
                                const Icon = modeIcon(item.mode);
                                return <div key={`${item.activityType}-${item._id}`} className="admin-activity-item">
                                    <div className="admin-material-icon"><Icon size={19} /></div>
                                    <div className="admin-activity-details"><strong>{item.material?.title || "Study material"}</strong><span>{item.mode === "VIRTUAL_INTERVIEW" ? `${item.questionStyle} virtual interview` : `${item.mode} · ${item.difficulty || "Medium"}`}</span></div>
                                    <div className="admin-activity-status"><span className={`admin-status-badge admin-status-${String(item.status || "completed").toLowerCase()}`}>{item.status || "Completed"}</span><time>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "—"}</time></div>
                                </div>;
                            })}</div> : <div className="admin-empty-state"><BrainCircuit size={28} /><p>No AI activity found</p></div>}
                        </article>

                        <article className="admin-dashboard-panel admin-system-panel">
                            <header><div><h2>AI system</h2><p>Current backend configuration</p></div><span className="admin-system-active"><CheckCircle2 size={15} />Active</span></header>
                            <div className="admin-system-summary"><div><span>Provider</span><strong>{aiSystem.provider || "Gemini"}</strong></div><div><span>Model</span><strong>{aiSystem.model || "Not configured"}</strong></div><div><span>Fallback</span><strong>{aiSystem.fallbackEnabled ? "Enabled" : "Disabled"}</strong></div><div><span>Agents</span><strong>{aiSystem.agents?.length || 0}</strong></div></div>
                        </article>
                    </section>
                </>}
            </main>
        </div>
    );
};

export default AdminDashboard;
