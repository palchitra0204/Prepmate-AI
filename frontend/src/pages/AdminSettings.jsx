import {
    BrainCircuit,
    FileText,
    KeyRound,
    Settings,
    ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import AdminSidebar from "../components/AdminSidebar";

import "../styles/admin.css";

const AdminSettings = () => {
    let storedUser = null;

    try {
        const userData =
            localStorage.getItem("user");

        storedUser = userData
            ? JSON.parse(userData)
            : null;
    } catch {
        storedUser = null;
    }

    const [settings, setSettings] =
        useState({
            provider: "Google Gemini",
            model: "Gemini",
            maximumFileSize: "10 MB",
            supportedFiles:
                "PDF, DOCX and TXT",
            demoFallback: true,
        });

    const [message, setMessage] =
        useState("");

    const handleChange = (event) => {
        const { name, value, checked, type } =
            event.target;

        setSettings((previousSettings) => ({
            ...previousSettings,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

        setMessage("");
    };

    const handleSave = (event) => {
        event.preventDefault();

        /*
         * Abhi ye settings frontend display
         * settings hain.
         *
         * Gemini API key backend .env mein hi
         * secure rahegi.
         */

        setMessage(
            "Settings saved successfully"
        );
    };

    return (
        <div className="admin-page">
            <AdminSidebar />

            <main className="admin-main">
                <header className="admin-page-header">
                    <div>
                        <p className="admin-eyebrow">
                            ADMIN SETTINGS
                        </p>

                        <h1>Platform settings</h1>

                        <span>
                            View AI configuration, file
                            limits and administrator
                            information.
                        </span>
                    </div>

                    <div className="admin-ai-status">
                        <Settings size={21} />

                        <div>
                            <span>Configuration</span>

                            <strong>Active</strong>
                        </div>
                    </div>
                </header>

                {message && (
                    <div className="admin-success-message">
                        {message}
                    </div>
                )}

                <div className="admin-settings-layout">
                    <form
                        className="admin-settings-form"
                        onSubmit={handleSave}
                    >
                        <section className="admin-settings-card">
                            <header className="admin-settings-card-header">
                                <div className="admin-settings-card-icon">
                                    <BrainCircuit
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2>
                                        AI configuration
                                    </h2>

                                    <p>
                                        Current artificial
                                        intelligence provider
                                    </p>
                                </div>
                            </header>

                            <div className="admin-settings-fields">
                                <div className="admin-setting-field">
                                    <label htmlFor="provider">
                                        AI provider
                                    </label>

                                    <input
                                        id="provider"
                                        type="text"
                                        name="provider"
                                        value={settings.provider}
                                        onChange={handleChange}
                                        readOnly
                                    />
                                </div>

                                <div className="admin-setting-field">
                                    <label htmlFor="model">
                                        AI model
                                    </label>

                                    <input
                                        id="model"
                                        type="text"
                                        name="model"
                                        value={settings.model}
                                        onChange={handleChange}
                                        readOnly
                                    />
                                </div>

                                <label className="admin-toggle-setting">
                                    <div>
                                        <strong>
                                            Demo fallback
                                        </strong>

                                        <span>
                                            Use demo generation
                                            when Gemini is
                                            unavailable
                                        </span>
                                    </div>

                                    <input
                                        type="checkbox"
                                        name="demoFallback"
                                        checked={
                                            settings.demoFallback
                                        }
                                        onChange={handleChange}
                                    />

                                    <span className="admin-toggle-slider" />
                                </label>
                            </div>
                        </section>

                        <section className="admin-settings-card">
                            <header className="admin-settings-card-header">
                                <div className="admin-settings-card-icon">
                                    <FileText size={22} />
                                </div>

                                <div>
                                    <h2>Upload settings</h2>

                                    <p>
                                        Supported study
                                        material configuration
                                    </p>
                                </div>
                            </header>

                            <div className="admin-settings-fields">
                                <div className="admin-setting-field">
                                    <label
                                        htmlFor="maximumFileSize"
                                    >
                                        Maximum file size
                                    </label>

                                    <input
                                        id="maximumFileSize"
                                        type="text"
                                        name="maximumFileSize"
                                        value={
                                            settings.maximumFileSize
                                        }
                                        onChange={handleChange}
                                        readOnly
                                    />
                                </div>

                                <div className="admin-setting-field">
                                    <label
                                        htmlFor="supportedFiles"
                                    >
                                        Supported files
                                    </label>

                                    <input
                                        id="supportedFiles"
                                        type="text"
                                        name="supportedFiles"
                                        value={
                                            settings.supportedFiles
                                        }
                                        onChange={handleChange}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </section>

                        <button
                            type="submit"
                            className="admin-save-button"
                        >
                            Save settings
                        </button>
                    </form>

                    <aside className="admin-settings-side">
                        <section className="admin-settings-card">
                            <header className="admin-settings-card-header">
                                <div className="admin-settings-card-icon">
                                    <ShieldCheck
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2>
                                        Administrator
                                    </h2>

                                    <p>
                                        Current logged-in
                                        account
                                    </p>
                                </div>
                            </header>

                            <div className="admin-account-details">
                                <div className="admin-account-avatar">
                                    {storedUser?.name
                                        ?.charAt(0)
                                        .toUpperCase() ||
                                        "A"}
                                </div>

                                <strong>
                                    {storedUser?.name ||
                                        "Administrator"}
                                </strong>

                                <span>
                                    {storedUser?.email ||
                                        "No email available"}
                                </span>

                                <div className="admin-account-role">
                                    <ShieldCheck
                                        size={15}
                                    />

                                    {storedUser?.role ||
                                        "Admin"}
                                </div>
                            </div>
                        </section>

                        <section className="admin-security-note">
                            <KeyRound size={21} />

                            <div>
                                <strong>
                                    API key security
                                </strong>

                                <p>
                                    Gemini API key is stored
                                    securely in the backend
                                    environment file and is
                                    never displayed in the
                                    browser.
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;