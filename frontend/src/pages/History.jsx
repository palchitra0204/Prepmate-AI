import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Eye,
  FileQuestion,
  GraduationCap,
  History as HistoryIcon,
  MessageSquareText,
  Mic2,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  VscArchive,
  VscHistory,
  VscHome,
} from "react-icons/vsc";

import {
  useNavigate,
} from "react-router-dom";

import Dock from "../components/Dock";
import api from "../services/api";

import "../styles/history.css";


const modeDetails = {
  MCQ: {
    name: "MCQ Practice",
    shortName: "MCQ",
    icon: FileQuestion,
    route: "mcq",
  },

  QUESTION_ANSWER: {
    name: "Question & Answer",
    shortName: "Q&A",
    icon: BookOpen,
    route: "question-answer",
  },

  INTERVIEW: {
    name: "Interview Preparation",
    shortName: "Interview",
    icon: MessageSquareText,
    route: "interview",
  },

  VIRTUAL_INTERVIEW: {
    name: "Virtual Interview",
    shortName: "Virtual",
    icon: Mic2,
    route: "virtual-interview",
  },
};


const filters = [
  {
    value: "ALL",
    label: "All",
  },
  {
    value: "MCQ",
    label: "MCQ",
  },
  {
    value: "QUESTION_ANSWER",
    label: "Q&A",
  },
  {
    value: "INTERVIEW",
    label: "Interview",
  },
  {
    value: "VIRTUAL_INTERVIEW",
    label: "Virtual",
  },
];


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


const formatDate = (dateValue) => {
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


const getStatusClass = (status) => {
  return String(
    status || "Completed"
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


const normalizePreparationHistory = (
  preparations
) => {
  if (!Array.isArray(preparations)) {
    return [];
  }

  return preparations.map(
    (preparation) => ({
      ...preparation,

      historyType:
        "PREPARATION",
    })
  );
};


const normalizeVirtualHistory = (
  sessions
) => {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions.map(
    (session) => ({
      ...session,

      mode:
        "VIRTUAL_INTERVIEW",

      historyType:
        "VIRTUAL_INTERVIEW",
    })
  );
};


const History = () => {
  const navigate =
    useNavigate();

  const [history, setHistory] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [error, setError] =
    useState("");


  const dockItems = [
    {
      icon:
        <VscHome size={20} />,

      label:
        "Dashboard",

      onClick: () =>
        navigate(
          "/dashboard"
        ),
    },
    {
      icon:
        <VscArchive size={20} />,

      label:
        "Materials",

      onClick: () =>
        navigate(
          "/materials"
        ),
    },
    {
      icon:
        <VscHistory size={20} />,

      label:
        "History",

      onClick: () =>
        navigate(
          "/history"
        ),
    },
  ];


  const loadHistory =
    useCallback(
      async (
        showRefresh = false
      ) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const [
            preparationResult,
            virtualResult,
          ] =
            await Promise.allSettled(
              [
                api.get(
                  "/preparations/history"
                ),

                api.get(
                  "/virtual-interviews/history"
                ),
              ]
            );

          let preparationHistory =
            [];

          let virtualHistory =
            [];

          const requestErrors =
            [];


          if (
            preparationResult.status ===
            "fulfilled"
          ) {
            const response =
              preparationResult.value;

            preparationHistory =
              response.data
                ?.preparations ||
              response.data
                ?.history ||
              response.data
                ?.data ||
              [];
          } else {
            requestErrors.push(
              preparationResult
                .reason
            );
          }


          if (
            virtualResult.status ===
            "fulfilled"
          ) {
            const response =
              virtualResult.value;

            virtualHistory =
              response.data
                ?.sessions ||
              response.data
                ?.history ||
              response.data
                ?.data ||
              [];
          } else {
            requestErrors.push(
              virtualResult.reason
            );
          }


          const combinedHistory = [
            ...normalizePreparationHistory(
              preparationHistory
            ),

            ...normalizeVirtualHistory(
              virtualHistory
            ),
          ].sort(
            (
              firstItem,
              secondItem
            ) => {
              const firstDate =
                new Date(
                  firstItem.createdAt ||
                  0
                ).getTime();

              const secondDate =
                new Date(
                  secondItem.createdAt ||
                  0
                ).getTime();

              return (
                secondDate -
                firstDate
              );
            }
          );

          setHistory(
            combinedHistory
          );


          if (
            requestErrors.length ===
            2
          ) {
            const firstError =
              requestErrors[0];

            const status =
              firstError
                ?.response
                ?.status;

            if (
              status === 401 ||
              status === 403
            ) {
              setError(
                "Your login session has expired. Please login again."
              );
            } else {
              setError(
                firstError
                  ?.response
                  ?.data
                  ?.message ||
                "Unable to load history."
              );
            }
          } else if (
            requestErrors.length ===
            1
          ) {
            setError(
              "Some history records could not be loaded. Please refresh and try again."
            );
          }
        } catch (
        requestError
        ) {
          console.error(
            "Load history error:",
            requestError
              .response
              ?.data ||
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
            "Unable to load history."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );


  useEffect(() => {
    loadHistory();
  }, [loadHistory]);


  const filteredHistory =
    useMemo(
      () => {
        const searchValue =
          search
            .trim()
            .toLowerCase();

        return history.filter(
          (item) => {
            const details =
              modeDetails[
              item.mode
              ];

            const matchesMode =
              activeFilter ===
              "ALL" ||
              item.mode ===
              activeFilter;

            const interviewType =
              interviewTypeLabels[
              item
                .interviewType
              ] || "";

            const searchableText =
              [
                item.material
                  ?.title,

                item.material
                  ?.originalFileName,

                details?.name,

                details?.shortName,

                item.difficulty,

                item.status,

                item.questionStyle,

                interviewType,
              ]
                .filter(
                  Boolean
                )
                .join(" ")
                .toLowerCase();

            return (
              matchesMode &&
              searchableText.includes(
                searchValue
              )
            );
          }
        );
      },
      [
        activeFilter,
        history,
        search,
      ]
    );


  const summary =
    useMemo(() => {
      return history.reduce(
        (
          counts,
          item
        ) => {
          const status =
            String(
              item.status ||
              ""
            ).toLowerCase();

          if (
            status ===
            "completed"
          ) {
            counts.completed +=
              1;
          }

          if (
            item.mode ===
            "MCQ"
          ) {
            counts.mcq += 1;
          }

          if (
            item.mode ===
            "VIRTUAL_INTERVIEW"
          ) {
            counts.virtual +=
              1;
          }

          if (
            [
              "active",
              "pending",
              "generating",
              "processing",
              "in progress",
            ].includes(status)
          ) {
            counts.inProgress +=
              1;
          }

          return counts;
        },
        {
          completed: 0,
          inProgress: 0,
          mcq: 0,
          virtual: 0,
        }
      );
    }, [history]);


  const viewResult = (item) => {
    if (!item?._id) {
      setError(
        "History ID is missing."
      );

      return;
    }

    const status =
      String(
        item.status ||
        "Completed"
      ).toLowerCase();

    if (
      status !== "completed"
    ) {
      setError(
        "This result is not ready yet."
      );

      return;
    }

    setError("");

    if (
      item.historyType ===
      "VIRTUAL_INTERVIEW"
    ) {
      navigate(
        `/history/virtual/${item._id}`
      );

      return;
    }

    navigate(
      `/history/${item._id}`
    );
  };


  const generateAgain = (
    item
  ) => {
    const details =
      modeDetails[item.mode];

    const materialId =
      item.material?._id;

    if (
      !details ||
      !materialId
    ) {
      setError(
        "This material is no longer available."
      );

      return;
    }

    setError("");

    navigate(
      `/prepare/${materialId}/${details.route}`,
      {
        state: {
          material:
            item.material,

          difficulty:
            item.difficulty ||
            "Medium",

          questionCount:
            String(
              item.questionCount ||
              10
            ),

          interviewType:
            item.interviewType,

          questionStyle:
            item.questionStyle,
        },
      }
    );
  };


  const deleteHistory =
    async (item) => {
      if (!item?._id) {
        setError(
          "History ID is missing."
        );

        return;
      }

      const isVirtual =
        item.historyType ===
        "VIRTUAL_INTERVIEW";

      const confirmed =
        window.confirm(
          isVirtual
            ? "Are you sure you want to delete this virtual interview history?"
            : "Are you sure you want to delete this preparation history?"
        );

      if (!confirmed) {
        return;
      }

      const deletionKey =
        `${item.historyType}-${item._id}`;

      try {
        setDeletingId(
          deletionKey
        );

        setError("");

        const endpoint =
          isVirtual
            ? `/virtual-interviews/${item._id}`
            : `/preparations/${item._id}`;

        await api.delete(
          endpoint
        );

        setHistory(
          (
            previousHistory
          ) =>
            previousHistory.filter(
              (
                historyItem
              ) =>
                !(
                  historyItem._id ===
                  item._id &&
                  historyItem
                    .historyType ===
                  item.historyType
                )
            )
        );
      } catch (
      requestError
      ) {
        console.error(
          "Delete history error:",
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
            "This history record was not found."
          );
        } else {
          setError(
            requestError
              .response
              ?.data
              ?.message ||
            "Unable to delete history."
          );
        }
      } finally {
        setDeletingId("");
      }
    };


  const hasActiveFilters =
    Boolean(
      search.trim()
    ) ||
    activeFilter !== "ALL";


  return (
    <div className="history-page">
      <div
        className="history-background-art"
        aria-hidden="true"
      >
        <span className="history-orbit history-orbit-one" />
        <span className="history-orbit history-orbit-two" />

        <span className="history-floating-icon history-floating-book">
          <BookOpen size={31} />
        </span>

        <span className="history-floating-icon history-floating-brain">
          <BrainCircuit size={31} />
        </span>

        <span className="history-floating-icon history-floating-history">
          <HistoryIcon size={31} />
        </span>

        <span className="history-floating-icon history-floating-question">
          <FileQuestion size={29} />
        </span>

        <span className="history-floating-icon history-floating-cap">
          <GraduationCap
            size={30}
          />
        </span>
      </div>

      <main className="history-content">
        <header className="history-header">
          <div>
            <div className="history-eyebrow">
              <Sparkles size={15} />
              Preparation History
            </div>

            <h1>
              Learn, Practice,{" "}
              <span>Improve</span>
            </h1>

            <p>
              Review your previous
              preparation and virtual
              interview sessions.
            </p>
          </div>

          <button
            type="button"
            className="history-refresh-button"
            onClick={() =>
              loadHistory(true)
            }
            disabled={
              refreshing ||
              loading
            }
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "history-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </header>

        <section
          className="history-summary"
          aria-label="History summary"
        >
          <article>
            <div className="history-summary-icon">
              <BookOpen
                size={21}
              />
            </div>

            <div className="history-summary-info">
              <strong>
                {loading
                  ? "—"
                  : history.length}
              </strong>

              <span>
                Total Sessions
              </span>
            </div>
          </article>

          <article>
            <div className="history-summary-icon">
              <CheckCircle2
                size={21}
              />
            </div>

            <div className="history-summary-info">
              <strong>
                {loading
                  ? "—"
                  : summary.completed}
              </strong>

              <span>
                Completed
              </span>
            </div>
          </article>

          <article>
            <div className="history-summary-icon">
              <Clock3
                size={21}
              />
            </div>

            <div className="history-summary-info">
              <strong>
                {loading
                  ? "—"
                  : summary.inProgress}
              </strong>

              <span>
                In Progress
              </span>
            </div>
          </article>

          <article>
            <div className="history-summary-icon">
              <Mic2
                size={21}
              />
            </div>

            <div className="history-summary-info">
              <strong>
                {loading
                  ? "—"
                  : summary.virtual}
              </strong>

              <span>
                Virtual Sessions
              </span>
            </div>
          </article>
        </section>

        <section className="history-toolbar">
          <label
            className="history-search"
            htmlFor="history-search-input"
          >
            <Search size={18} />

            <input
              id="history-search-input"
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Search your history..."
            />
          </label>

          <div
            className="history-filters"
            aria-label="Filter history"
          >
            {filters.map(
              (filter) => (
                <button
                  key={
                    filter.value
                  }
                  type="button"
                  className={
                    activeFilter ===
                      filter.value
                      ? "history-filter-active"
                      : ""
                  }
                  onClick={() =>
                    setActiveFilter(
                      filter.value
                    )
                  }
                  aria-pressed={
                    activeFilter ===
                    filter.value
                  }
                >
                  {filter.label}
                </button>
              )
            )}
          </div>
        </section>

        {error && (
          <div
            className="history-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="history-empty">
            <div className="history-empty-icon history-loading-icon">
              <RefreshCw
                size={28}
              />
            </div>

            <h2>
              Loading your history...
            </h2>

            <p>
              Please wait while we find
              your preparation sessions.
            </p>
          </div>
        ) : filteredHistory.length ===
          0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">
              <HistoryIcon
                size={30}
              />
            </div>

            <h2>
              {hasActiveFilters
                ? "No matching history found"
                : "No preparation history yet"}
            </h2>

            <p>
              {hasActiveFilters
                ? "Try another search or select a different preparation type."
                : "Start preparing from your materials and your sessions will appear here."}
            </p>

            {!hasActiveFilters && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/materials"
                  )
                }
              >
                Go to Materials
              </button>
            )}
          </div>
        ) : (
          <section
            className="history-list"
            aria-label="Preparation history"
          >
            {filteredHistory.map(
              (item) => {
                const details =
                  modeDetails[
                  item.mode
                  ] ||
                  modeDetails
                    .MCQ;

                const Icon =
                  details.icon;

                const materialExists =
                  Boolean(
                    item
                      .material
                      ?._id
                  );

                const status =
                  item.status ||
                  "Completed";

                const statusClass =
                  getStatusClass(
                    status
                  );

                const isCompleted =
                  status
                    .toLowerCase() ===
                  "completed";

                const isVirtual =
                  item.historyType ===
                  "VIRTUAL_INTERVIEW";

                const questionCount =
                  item.questionCount ??
                  item.content
                    ?.length ??
                  item.questions
                    ?.length ??
                  0;

                const deletionKey =
                  `${item.historyType}-${item._id}`;

                return (
                  <article
                    key={
                      deletionKey
                    }
                    className={`history-card ${isVirtual
                      ? "history-card-virtual"
                      : ""
                      }`}
                  >
                    <div className="history-icon">
                      <Icon
                        size={23}
                      />
                    </div>

                    <div className="history-details">
                      <div className="history-title-row">
                        <h2>
                          {item
                            .material
                            ?.title ||
                            "Deleted material"}
                        </h2>

                        <span
                          className={`history-status history-status-${statusClass}`}
                        >
                          {
                            status
                          }
                        </span>
                      </div>

                      <p>
                        <strong>
                          {
                            details.name
                          }
                        </strong>

                        <span aria-hidden="true">
                          •
                        </span>

                        {isVirtual
                          ? interviewTypeLabels[
                          item
                            .interviewType
                          ] ||
                          "Study Viva"
                          : item.difficulty ||
                          "Medium"}

                        <span aria-hidden="true">
                          •
                        </span>

                        {isVirtual
                          ? `${item.questionStyle ||
                          "STATIC"
                          } questions`
                          : `${questionCount} questions`}
                      </p>

                      {isVirtual && (
                        <p className="history-virtual-meta">
                          <span>
                            {
                              item.difficulty
                            }
                          </span>

                          <span aria-hidden="true">
                            •
                          </span>

                          <span>
                            {
                              questionCount
                            }{" "}
                            questions
                          </span>

                          {isCompleted && (
                            <>
                              <span aria-hidden="true">
                                •
                              </span>

                              <span>
                                {item.percentage ||
                                  0}
                                %
                                score
                              </span>
                            </>
                          )}
                        </p>
                      )}

                      <time
                        dateTime={
                          item.createdAt ||
                          undefined
                        }
                      >
                        {formatDate(
                          item.createdAt
                        )}
                      </time>
                    </div>

                    <div className="history-actions">
                      <button
                        type="button"
                        className="history-view-button"
                        onClick={() =>
                          viewResult(
                            item
                          )
                        }
                        disabled={
                          !isCompleted
                        }
                        title={
                          isCompleted
                            ? "View result"
                            : "Result is not ready"
                        }
                      >
                        <Eye
                          size={16}
                        />
                        View
                      </button>

                      {materialExists && (
                        <button
                          type="button"
                          className="history-generate-button"
                          onClick={() =>
                            generateAgain(
                              item
                            )
                          }
                        >
                          <RefreshCw
                            size={16}
                          />

                          {isVirtual
                            ? "Again"
                            : "Again"}
                        </button>
                      )}

                      <button
                        type="button"
                        className="history-delete-button"
                        disabled={
                          deletingId ===
                          deletionKey
                        }
                        onClick={() =>
                          deleteHistory(
                            item
                          )
                        }
                        aria-label={`Delete ${item
                          .material
                          ?.title ||
                          "history"
                          }`}
                      >
                        {deletingId ===
                          deletionKey ? (
                          <RefreshCw
                            className="history-spin"
                            size={17}
                          />
                        ) : (
                          <Trash2
                            size={17}
                          />
                        )}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}
      </main>

      <Dock
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
        distance={200}
      />
    </div>
  );
};

export default History;