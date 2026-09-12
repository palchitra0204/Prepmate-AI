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
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  VscArchive,
  VscCommentDiscussion,
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
];


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


const History = () => {
  const navigate =
    useNavigate();


  const [
    history,
    setHistory,
  ] = useState([]);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    activeFilter,
    setActiveFilter,
  ] = useState("ALL");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    deletingId,
    setDeletingId,
  ] = useState("");


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     DOCK
  ===================================================== */

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

    {
      icon:
        <VscCommentDiscussion
          size={20}
        />,

      label:
        "Chat",

      onClick: () =>
        navigate(
          "/dashboard"
        ),
    },
  ];


  /* =====================================================
     LOAD HISTORY
  ===================================================== */

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


          const response =
            await api.get(
              "/preparations/history"
            );


          setHistory(
            response.data
              .preparations ||
            []
          );

        } catch (
        requestError
        ) {
          setError(
            requestError.response
              ?.data?.message ||
            "Unable to load preparation history"
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


  /* =====================================================
     FILTER HISTORY
  ===================================================== */

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


            const searchableText =
              [
                item.material
                  ?.title,

                item.material
                  ?.originalFileName,

                details?.name,

                details
                  ?.shortName,

                item.difficulty,

                item.status,
              ]
                .filter(Boolean)
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


  /* =====================================================
     COUNTS
  ===================================================== */

  const completedCount =
    history.filter(
      (item) =>
        item.status
          ?.toLowerCase() ===
        "completed"
    ).length;


  const mcqCount =
    history.filter(
      (item) =>
        item.mode ===
        "MCQ"
    ).length;


  const inProgressCount =
    history.filter(
      (item) => {
        const status =
          item.status
            ?.toLowerCase();

        return (
          status ===
          "generating" ||
          status ===
          "processing" ||
          status ===
          "in progress"
        );
      }
    ).length;


  /* =====================================================
     VIEW RESULT
  ===================================================== */

  const viewResult = (
    preparationId
  ) => {
    navigate(
      `/history/${preparationId}`
    );
  };


  /* =====================================================
     GENERATE AGAIN
  ===================================================== */

  const generateAgain = (
    item
  ) => {
    const details =
      modeDetails[
      item.mode
      ];


    const materialId =
      item.material?._id;


    if (
      !details ||
      !materialId
    ) {
      setError(
        "This material is no longer available"
      );

      return;
    }


    navigate(
      `/prepare/${materialId}/${details.route}`
    );
  };


  /* =====================================================
     DELETE HISTORY
  ===================================================== */

  const deleteHistory =
    async (
      preparationId
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this preparation history?"
        );


      if (!confirmed) {
        return;
      }


      try {
        setDeletingId(
          preparationId
        );

        setError("");


        await api.delete(
          `/preparations/${preparationId}`
        );


        setHistory(
          (
            previousHistory
          ) =>
            previousHistory.filter(
              (item) =>
                item._id !==
                preparationId
            )
        );

      } catch (
      requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
          "Unable to delete preparation history"
        );

      } finally {
        setDeletingId("");
      }
    };


  return (
    <div className="history-page">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="history-background-art"
        aria-hidden="true"
      >

        <span
          className="
            history-orbit
            history-orbit-one
          "
        />

        <span
          className="
            history-orbit
            history-orbit-two
          "
        />


        <span
          className="
            history-floating-icon
            history-floating-book
          "
        >
          <BookOpen size={31} />
        </span>


        <span
          className="
            history-floating-icon
            history-floating-brain
          "
        >
          <BrainCircuit size={31} />
        </span>


        <span
          className="
            history-floating-icon
            history-floating-history
          "
        >
          <HistoryIcon size={31} />
        </span>


        <span
          className="
            history-floating-icon
            history-floating-question
          "
        >
          <FileQuestion size={29} />
        </span>


        <span
          className="
            history-floating-icon
            history-floating-cap
          "
        >
          <GraduationCap size={30} />
        </span>

      </div>


      <main className="history-content">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="history-header">

          <div>

            <div className="history-eyebrow">
              <Sparkles size={15} />

              Preparation History
            </div>


            <h1>
              Learn, Practice,{" "}

              <span>
                Improve
              </span>
            </h1>


            <p>
              Review your previous preparation sessions
              and keep track of your learning progress.
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
              : "Refresh"
            }

          </button>

        </header>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section
          className="history-summary"
          aria-label="History summary"
        >

          <article>

            <div className="history-summary-icon">
              <BookOpen size={21} />
            </div>


            <div className="history-summary-info">
              <strong>
                {loading
                  ? "—"
                  : history.length
                }
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
                  : completedCount
                }
              </strong>

              <span>
                Completed
              </span>
            </div>

          </article>


          <article>

            <div className="history-summary-icon">
              <Clock3 size={21} />
            </div>


            <div className="history-summary-info">
              <strong>
                {loading
                  ? "—"
                  : inProgressCount
                }
              </strong>

              <span>
                In Progress
              </span>
            </div>

          </article>


          <article>

            <div className="history-summary-icon">
              <FileQuestion
                size={21}
              />
            </div>


            <div className="history-summary-info">
              <strong>
                {loading
                  ? "—"
                  : mcqCount
                }
              </strong>

              <span>
                MCQ Sessions
              </span>
            </div>

          </article>

        </section>


        {/* =================================================
            TOOLBAR
        ================================================= */}

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
                  event.target.value
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
                >
                  {filter.label}
                </button>

              )
            )}

          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="history-error"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (

          <div className="history-empty">

            <div
              className="
                history-empty-icon
                history-loading-icon
              "
            >
              <RefreshCw size={28} />
            </div>


            <h2>
              Loading your history...
            </h2>


            <p>
              Please wait while we find your
              preparation sessions.
            </p>

          </div>

        ) : filteredHistory.length ===
          0 ? (

          <div className="history-empty">

            <div className="history-empty-icon">
              <HistoryIcon size={30} />
            </div>


            <h2>
              {search ||
                activeFilter !== "ALL"
                ? "No matching history found"
                : "No preparation history yet"
              }
            </h2>


            <p>
              {search ||
                activeFilter !== "ALL"
                ? "Try another search or select a different preparation type."
                : "Start preparing from your study materials and your sessions will appear here."
              }
            </p>


            {!search &&
              activeFilter ===
              "ALL" && (

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
                  modeDetails.MCQ;


                const Icon =
                  details.icon;


                const materialExists =
                  Boolean(
                    item.material?._id
                  );


                const status =
                  item.status ||
                  "Completed";


                const statusClass =
                  status
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    );


                const questionCount =
                  item.questionCount ||
                  item.content
                    ?.length ||
                  0;


                return (
                  <article
                    key={item._id}
                    className="history-card"
                  >

                    <div className="history-icon">
                      <Icon size={23} />
                    </div>


                    <div className="history-details">

                      <div className="history-title-row">

                        <h2>
                          {item.material
                            ?.title ||
                            "Deleted material"
                          }
                        </h2>


                        <span
                          className={`
                            history-status
                            history-status-${statusClass}
                          `}
                        >
                          {status}
                        </span>

                      </div>


                      <p>

                        <strong>
                          {details.name}
                        </strong>


                        <span aria-hidden="true">
                          •
                        </span>


                        {item.difficulty ||
                          "Medium"
                        }


                        <span aria-hidden="true">
                          •
                        </span>


                        {questionCount} questions

                      </p>


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
                            item._id
                          )
                        }
                      >

                        <Eye size={16} />

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

                          Again

                        </button>

                      )}


                      <button
                        type="button"
                        className="history-delete-button"

                        disabled={
                          deletingId ===
                          item._id
                        }

                        onClick={() =>
                          deleteHistory(
                            item._id
                          )
                        }

                        aria-label={
                          `Delete ${item.material
                            ?.title ||
                          "history"
                          }`
                        }
                      >

                        {deletingId ===
                          item._id ? (

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