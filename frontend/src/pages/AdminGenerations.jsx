import {
  BookOpen,
  FileQuestion,
  History,
  LoaderCircle,
  MessageSquareText,
  Search,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminSidebar from "../components/AdminSidebar";
import api from "../services/api";

import "../styles/admin.css";

const AdminGenerations = () => {
  const [
    preparations,
    setPreparations,
  ] = useState([]);

  const [search, setSearch] =
    useState("");

  const [modeFilter, setModeFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadPreparations =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response = await api.get(
            "/admin/preparations"
          );

          setPreparations(
            response.data
              ?.preparations || []
          );
        } catch (requestError) {
          console.error(
            "Admin Generations Error:",
            requestError.response
              ?.data ||
              requestError.message
          );

          setError(
            requestError.response?.data
              ?.message ||
              "Unable to load AI generations"
          );
        } finally {
          setLoading(false);
        }
      };

    loadPreparations();
  }, []);

  const getModeInformation = (
    mode
  ) => {
    if (mode === "MCQ") {
      return {
        title: "MCQ Test",
        icon: FileQuestion,
      };
    }

    if (
      mode === "QUESTION_ANSWER"
    ) {
      return {
        title: "Question & Answers",
        icon: BookOpen,
      };
    }

    return {
      title: "Interview Questions",
      icon: MessageSquareText,
    };
  };

  const filteredPreparations =
    useMemo(() => {
      const searchValue = search
        .trim()
        .toLowerCase();

      return preparations.filter(
        (preparation) => {
          const matchesMode =
            modeFilter === "ALL" ||
            preparation.mode ===
              modeFilter;

          const searchableContent = [
            preparation.mode,
            preparation.difficulty,
            preparation.material?.title,
            preparation.user?.name,
            preparation.user?.email,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !searchValue ||
            searchableContent.includes(
              searchValue
            );

          return (
            matchesMode &&
            matchesSearch
          );
        }
      );
    }, [
      preparations,
      search,
      modeFilter,
    ]);

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">
              AI ACTIVITY
            </p>

            <h1>AI generations</h1>

            <span>
              View MCQ, question-answer and
              interview preparation activity.
            </span>
          </div>

          <div className="admin-ai-status">
            <Sparkles size={21} />

            <div>
              <span>
                Total generations
              </span>

              <strong>
                {preparations.length}
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
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
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
              Interview
            </option>
          </select>
        </section>

        {error && (
          <div className="admin-error">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="admin-loading">
            <LoaderCircle
              size={30}
              className="admin-spin"
            />

            <p>
              Loading AI generations...
            </p>
          </div>
        ) : !error &&
          filteredPreparations.length ===
            0 ? (
          <div className="admin-data-card">
            <div className="admin-empty-state">
              <History size={30} />

              <p>
                No AI generations found
              </p>
            </div>
          </div>
        ) : (
          !error && (
            <section className="admin-generation-grid">
              {filteredPreparations.map(
                (preparation) => {
                  const mode =
                    getModeInformation(
                      preparation.mode
                    );

                  const ModeIcon =
                    mode.icon;

                  const contentCount =
                    Array.isArray(
                      preparation.content
                    )
                      ? preparation.content
                          .length
                      : preparation.questionCount ||
                        0;

                  return (
                    <article
                      key={preparation._id}
                      className="admin-generation-card"
                    >
                      <div className="admin-generation-card-top">
                        <div className="admin-statistic-icon">
                          <ModeIcon
                            size={22}
                          />
                        </div>

                        <div className="admin-generation-card-top">
                          <div className="admin-statistic-icon">
                            <ModeIcon size={22} />
                          </div>

                          <div className="admin-generation-badges">
                            <span className="admin-role-badge">
                              {preparation.difficulty ||
                                "Medium"}
                            </span>

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
                          </div>
                        </div>

                        <span className="admin-role-badge">
                          {preparation.difficulty ||
                            "Medium"}
                        </span>
                      </div>

                      <h2>
                        {mode.title}
                      </h2>

                      <p>
                        {preparation.material
                          ?.title ||
                          preparation.materialTitle ||
                          "Study material"}
                      </p>

                      <div className="admin-generation-meta">
                        <span>
                          {contentCount}{" "}
                          questions
                        </span>

                        <span>
                          {preparation.agentTrace
                            ?.length || 0}{" "}
                          agents
                        </span>

                        <time>
                          {preparation.createdAt
                            ? new Date(
                                preparation.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </time>
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          )
        )}
      </main>
    </div>
  );
};

export default AdminGenerations;