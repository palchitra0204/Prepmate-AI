import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  BrainCircuit,
  CalendarDays,
  File,
  FileQuestion,
  FileText,
  MessageCircle,
  GraduationCap,
  MoreHorizontal,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  VscArchive,
  VscCommentDiscussion,
  VscHistory,
  VscHome,
} from "react-icons/vsc";

import DeleteMaterialModal from "../components/DeleteMaterialModal";
import Dock from "../components/Dock";
import ThemeSelect from "../components/ThemeSelect";
import api from "../services/api";

import "../styles/materials.css";

const Materials = () => {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [typeFilter, setTypeFilter] =
    useState("All");
  const [sortOrder, setSortOrder] =
    useState("Newest");

  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const [
    selectedMaterial,
    setSelectedMaterial,
  ] = useState(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const dockItems = [
    {
      icon: <VscHome size={20} />,
      label: "Dashboard",
      onClick: () =>
        navigate("/dashboard"),
    },
    {
      icon: <VscArchive size={20} />,
      label: "Materials",
      onClick: () =>
        navigate("/materials"),
    },
    {
      icon: <VscHistory size={20} />,
      label: "History",
      onClick: () =>
        navigate("/history"),
    },
    {
      icon: (
        <VscCommentDiscussion size={20} />
      ),
      label: "Chat",
      onClick: () =>
        navigate("/chat"),
    },
  ];

  const loadMaterials = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/materials");

        setMaterials(
          response.data.materials || []
        );
      } catch (requestError) {
        console.error(
          "Load materials error:",
          requestError.response?.data ||
          requestError
        );

        setError(
          requestError.response?.data
            ?.message ||
          "Unable to load materials"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const getFileType = (material) => {
    const currentType =
      material.fileType ||
      material.originalFileName
        ?.split(".")
        .pop() ||
      "FILE";

    return String(currentType)
      .replace(".", "")
      .toUpperCase();
  };

  const filteredMaterials = useMemo(
    () => {
      const cleanedSearch = search
        .trim()
        .toLowerCase();

      const filteredResult =
        materials.filter((material) => {
          const title =
            material.title
              ?.toLowerCase() || "";

          const fileName =
            material.originalFileName
              ?.toLowerCase() || "";

          const matchesSearch =
            title.includes(cleanedSearch) ||
            fileName.includes(
              cleanedSearch
            );

          const matchesStatus =
            statusFilter === "All" ||
            material.status ===
            statusFilter;

          const materialType =
            getFileType(material);

          const matchesType =
            typeFilter === "All" ||
            materialType === typeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        });

      return [...filteredResult].sort(
        (
          firstMaterial,
          secondMaterial
        ) => {
          const firstDate = new Date(
            firstMaterial.createdAt
          ).getTime();

          const secondDate = new Date(
            secondMaterial.createdAt
          ).getTime();

          if (sortOrder === "Oldest") {
            return (
              firstDate - secondDate
            );
          }

          if (sortOrder === "A-Z") {
            return (
              firstMaterial.title || ""
            ).localeCompare(
              secondMaterial.title || ""
            );
          }

          return secondDate - firstDate;
        }
      );
    },
    [
      materials,
      search,
      statusFilter,
      typeFilter,
      sortOrder,
    ]
  );

  const handleDelete = async (
    material
  ) => {
    if (!material?._id) {
      setError(
        "Material ID is missing"
      );
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      await api.delete(
        `/materials/${material._id}`
      );

      setMaterials(
        (previousMaterials) =>
          previousMaterials.filter(
            (item) =>
              String(item._id) !==
              String(material._id)
          )
      );

      setSelectedMaterial(null);
    } catch (requestError) {
      console.error(
        "Delete material error:",
        requestError.response?.data ||
        requestError
      );

      const status =
        requestError.response?.status;

      if (
        status === 401 ||
        status === 403
      ) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else if (status === 404) {
        setError(
          requestError.response?.data
            ?.message ||
          "Material was not found."
        );
      } else {
        setError(
          requestError.response?.data
            ?.message ||
          "Unable to delete material"
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    typeFilter !== "All" ||
    statusFilter !== "All";

  return (
    <div className="materials-page">
      {/* Floating background icons */}

      <div
        className="materials-background-art"
        aria-hidden="true"
      >
        <span className="materials-orbit materials-orbit-one" />
        <span className="materials-orbit materials-orbit-two" />
        <span className="materials-orbit materials-orbit-three" />

        <span className="materials-floating-icon materials-float-book">
          <BookOpen size={34} />
        </span>

        <span className="materials-floating-icon materials-float-file">
          <FileText size={32} />
        </span>

        <span className="materials-floating-icon materials-float-brain">
          <BrainCircuit size={31} />
        </span>

        <span className="materials-floating-icon materials-float-question">
          <FileQuestion size={30} />
        </span>

        <span className="materials-floating-icon materials-float-cap">
          <GraduationCap size={32} />
        </span>

        <span className="materials-floating-icon materials-float-sparkle">
          <Sparkles size={27} />
        </span>
      </div>

      <main className="materials-content">
        <header className="materials-header">
          <div>
            <p className="materials-eyebrow">
              Study Library
            </p>

            <h1>
              My <span>Materials</span>
            </h1>

            <p className="materials-subtitle">
              Manage and prepare from
              your uploaded study
              content.
            </p>
          </div>

          <Link
            to="/upload"
            className="add-material-button"
          >
            <Upload size={20} />
            Upload Material
          </Link>
        </header>

        <section className="materials-toolbar">
          <div className="materials-search">
            <Search size={19} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search your materials..."
              aria-label="Search materials"
            />
          </div>

          <div className="materials-filter">
            <ThemeSelect
              value={typeFilter}
              onChange={setTypeFilter}
              ariaLabel="Filter by file type"
              options={[
                {
                  value: "All",
                  label: "All Types",
                },
                {
                  value: "PDF",
                  label: "PDF",
                },
                {
                  value: "DOCX",
                  label: "DOCX",
                },
                {
                  value: "TXT",
                  label: "Text",
                },
                {
                  value: "PPTX",
                  label: "PowerPoint",
                },
              ]}
            />
          </div>

          <div className="materials-filter">
            <ThemeSelect
              value={statusFilter}
              onChange={setStatusFilter}
              ariaLabel="Filter by status"
              options={[
                {
                  value: "All",
                  label: "All Status",
                },
                {
                  value: "Uploaded",
                  label: "Uploaded",
                },
                {
                  value: "Processing",
                  label: "Processing",
                },
                {
                  value: "Ready",
                  label: "Ready",
                },
                {
                  value: "Failed",
                  label: "Failed",
                },
              ]}
            />
          </div>

          <div className="materials-filter">
            <ThemeSelect
              value={sortOrder}
              onChange={setSortOrder}
              ariaLabel="Sort materials"
              options={[
                {
                  value: "Newest",
                  label: "Newest First",
                },
                {
                  value: "Oldest",
                  label: "Oldest First",
                },
                {
                  value: "A-Z",
                  label: "A-Z",
                },
              ]}
            />
          </div>
        </section>

        {error && (
          <div
            className="materials-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading ? (
          <section className="materials-empty">
            <Sparkles size={38} />

            <h2>
              Loading materials...
            </h2>

            <p>
              Please wait while your
              study library loads.
            </p>
          </section>
        ) : filteredMaterials.length ===
          0 ? (
          <section className="materials-empty">
            <FileText size={42} />

            <h2>
              {hasActiveFilters
                ? "No matching materials found"
                : "No materials uploaded yet"}
            </h2>

            <p>
              {hasActiveFilters
                ? "Try changing your search or filters."
                : "Upload your first study material and start preparing with PrepMate."}
            </p>

            {!hasActiveFilters && (
              <Link to="/upload">
                <Upload size={17} />
                Upload Material
              </Link>
            )}
          </section>
        ) : (
          <section className="materials-grid">
            {filteredMaterials.map(
              (material) => {
                const fileType =
                  getFileType(material);

                const isPDF =
                  fileType === "PDF";

                const isDOCX =
                  fileType === "DOCX" ||
                  fileType === "DOC";

                const isPPTX =
                  fileType === "PPTX" ||
                  fileType === "PPT";

                const isReady =
                  material.status ===
                  "Ready";

                let cardClass =
                  "material-card-purple";

                if (isDOCX) {
                  cardClass =
                    "material-card-blue";
                }

                if (isPPTX) {
                  cardClass =
                    "material-card-pptx";
                }

                return (
                  <article
                    key={material._id}
                    className={`material-card ${cardClass}`}
                  >
                    <FileText
                      className="material-decoration"
                      size={120}
                    />

                    <div className="material-card-top">
                      <div
                        className={`
                          material-file-badge
                          ${isPDF
                            ? "material-file-pdf"
                            : isDOCX
                              ? "material-file-docx"
                              : isPPTX
                                ? "material-file-pptx"
                                : "material-file-other"
                          }
                        `}
                      >
                        {isPDF ||
                          isDOCX ||
                          isPPTX ? (
                          <FileText
                            size={23}
                          />
                        ) : (
                          <File size={23} />
                        )}

                        <span>
                          {fileType}
                        </span>
                      </div>

                      <span
                        className={`
                          material-status
                          material-status-${material.status
                            ?.toLowerCase() ||
                          "uploaded"
                          }
                        `}
                      >
                        <span className="status-dot" />

                        {material.status ||
                          "Uploaded"}
                      </span>
                    </div>

                    <div className="material-card-body">
                      <h2>
                        {material.title ||
                          "Study Material"}
                      </h2>

                      <p>
                        {material.originalFileName ||
                          "Uploaded study material"}
                      </p>

                      <div className="material-meta">
                        <span>
                          <CalendarDays
                            size={15}
                          />

                          Uploaded{" "}

                          {material.createdAt
                            ? new Date(
                              material.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                            : "Recently"}
                        </span>
                      </div>
                    </div>

                    <div className="material-card-actions">
                      {material.status === "Ready" && (
                        <Link
                          to={`/chat/${material._id}`}
                          className="material-chat-action"
                        >
                          <MessageCircle size={17} />
                          Chat with AI
                        </Link>
                      )}

                      <button
                        type="button"
                        className="prepare-material-button"
                        disabled={!isReady}
                        onClick={() =>
                          navigate(
                            `/prepare/${material._id}`
                          )
                        }
                        title={
                          isReady
                            ? "Prepare from this material"
                            : "Material is not ready yet"
                        }
                      >
                        <Sparkles
                          size={17}
                        />
                        Prepare
                      </button>

                      <button
                        type="button"
                        className="material-more-button"
                        disabled={!isReady}
                        onClick={() =>
                          navigate(
                            `/prepare/${material._id}`
                          )
                        }
                        aria-label={`Open ${material.title ||
                          "material"
                          }`}
                        title={
                          isReady
                            ? "Open material"
                            : "Material is not ready yet"
                        }
                      >
                        <MoreHorizontal
                          size={19}
                        />
                      </button>

                      <button
                        type="button"
                        className="delete-material-button"
                        onClick={() =>
                          setSelectedMaterial(
                            material
                          )
                        }
                        disabled={isDeleting}
                        aria-label={`Delete ${material.title ||
                          "material"
                          }`}
                      >
                        <Trash2
                          size={18}
                        />
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

      <DeleteMaterialModal
        isOpen={Boolean(
          selectedMaterial
        )}
        material={selectedMaterial}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setSelectedMaterial(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Materials;