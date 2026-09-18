import { BrainCircuit, FileText, KeyRound, Settings, ShieldCheck } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";

const AdminSettings = () => {
    let user = null;
    try {
        const stored = localStorage.getItem("user");
        user = stored ? JSON.parse(stored) : null;
    } catch {
        user = null;
    }

    const configuration = {
        provider: "Google Gemini",
        model: import.meta.env.VITE_AI_MODEL || "Configured by backend",
        maximumFileSize: "10 MB",
        supportedFiles: "PDF, DOCX, TXT and PPTX",
    };

    return (
        <div className="admin-page">
            <AdminSidebar />
            <main className="admin-main">
                <header className="admin-page-header">
                    <div><p className="admin-eyebrow">ADMIN SETTINGS</p><h1>Platform settings</h1><span>View AI configuration, file limits and administrator information.</span></div>
                    <div className="admin-ai-status"><Settings size={21} /><div><span>Configuration</span><strong>Active</strong></div></div>
                </header>

                <div className="admin-settings-layout">
                    <div className="admin-settings-form">
                        <section className="admin-settings-card">
                            <header className="admin-settings-card-header"><div className="admin-settings-card-icon"><BrainCircuit size={22} /></div><div><h2>AI configuration</h2><p>Current artificial intelligence provider</p></div></header>
                            <div className="admin-settings-fields">
                                <div className="admin-setting-field"><label htmlFor="provider">AI provider</label><input id="provider" value={configuration.provider} readOnly /></div>
                                <div className="admin-setting-field"><label htmlFor="model">AI model</label><input id="model" value={configuration.model} readOnly /></div>
                            </div>
                        </section>

                        <section className="admin-settings-card">
                            <header className="admin-settings-card-header"><div className="admin-settings-card-icon"><FileText size={22} /></div><div><h2>Upload settings</h2><p>Supported study material configuration</p></div></header>
                            <div className="admin-settings-fields">
                                <div className="admin-setting-field"><label htmlFor="maximumFileSize">Maximum file size</label><input id="maximumFileSize" value={configuration.maximumFileSize} readOnly /></div>
                                <div className="admin-setting-field"><label htmlFor="supportedFiles">Supported files</label><input id="supportedFiles" value={configuration.supportedFiles} readOnly /></div>
                            </div>
                        </section>
                    </div>

                    <aside className="admin-settings-side">
                        <section className="admin-settings-card">
                            <header className="admin-settings-card-header"><div className="admin-settings-card-icon"><ShieldCheck size={22} /></div><div><h2>Administrator</h2><p>Current logged-in account</p></div></header>
                            <div className="admin-account-details"><div className="admin-account-avatar">{user?.name?.charAt(0).toUpperCase() || "A"}</div><strong>{user?.name || "Administrator"}</strong><span>{user?.email || "No email available"}</span><div className="admin-account-role"><ShieldCheck size={15} />{user?.role || "Admin"}</div></div>
                        </section>
                        <section className="admin-security-note"><KeyRound size={21} /><div><strong>API key security</strong><p>Gemini API key and fallback configuration stay in the backend .env file and are never exposed in the browser.</p></div></section>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;
