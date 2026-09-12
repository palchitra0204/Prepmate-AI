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
  const navigate =
    useNavigate();


  const [
    materials,
    setMaterials,
  ] = useState([]);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");


  const [
    typeFilter,
    setTypeFilter,
  ] = useState("All");


  const [
    sortOrder,
    setSortOrder,
  ] = useState("Newest");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    selectedMaterial,
    setSelectedMaterial,
  ] = useState(null);


  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);


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
          "/chat"
        ),
    },
  ];


  /* =====================================================
     LOAD MATERIALS
  ===================================================== */

  const loadMaterials =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");


          const response =
            await api.get(
              "/materials"
            );


          setMaterials(
            response.data
              .materials ||
            []
          );

        } catch (
          requestError
        ) {
          console.error(
            "Load materials error:",
            requestError.response
              ?.data ||
            requestError
          );


          setError(
            requestError.response
              ?.data?.message ||
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


  /* =====================================================
     FILE TYPE
  ===================================================== */

  const getFileType = (
    material
  ) => {
    const currentType =
      material.fileType ||

      material.originalFileName
        ?.split(".")
        .pop() ||

      "FILE";


    return String(
      currentType
    )
      .replace(".", "")
      .toUpperCase();
  };


  /* =====================================================
     FILTER MATERIALS
  ===================================================== */

  const filteredMaterials =
    useMemo(
      () => {
        const cleanedSearch =
          search
            .trim()
            .toLowerCase();


        const result =
          materials.filter(
            (material) => {
              const title =
                material.title
                  ?.toLowerCase() ||
                "";


              const fileName =
                material.originalFileName
                  ?.toLowerCase() ||
                "";


              const matchesSearch =
                title.includes(
                  cleanedSearch
                ) ||

                fileName.includes(
                  cleanedSearch
                );


              const matchesStatus =
                statusFilter ===
                  "All" ||

                material.status ===
                  statusFilter;


              const materialType =
                getFileType(
                  material
                );


              const matchesType =
                typeFilter ===
                  "All" ||

                materialType.includes(
                  typeFilter
                );


              return (
                matchesSearch &&
                matchesStatus &&
                matchesType
              );
            }
          );


        return [
          ...result,
        ].sort(
          (
            firstMaterial,
            secondMaterial
          ) => {
            const firstDate =
              new Date(
                firstMaterial.createdAt
              ).getTime();


            const secondDate =
              new Date(
                secondMaterial.createdAt
              ).getTime();


            if (
              sortOrder ===
              "Oldest"
            ) {
              return (
                firstDate -
                secondDate
              );
            }


            if (
              sortOrder ===
              "A-Z"
            ) {
              return (
                firstMaterial
                  .title ||
                ""
              ).localeCompare(
                secondMaterial
                  .title ||
                ""
              );
            }


            return (
              secondDate -
              firstDate
            );
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


  /* =====================================================
     DELETE MATERIAL
  ===================================================== */

  const handleDelete =
    async (
      material
    ) => {
      if (
        !material?._id
      ) {
        setError(
          "Material ID is missing"
        );

        return;
      }


      try {
        setIsDeleting(true);

        setError("");


        console.log(
          "Deleting material:",
          material._id
        );


        const response =
          await api.delete(
            `/materials/${material._id}`
          );


        console.log(
          "Delete response:",
          response.data
        );


        /*
         * Remove deleted material
         * immediately from frontend.
         */

        setMaterials(
          (
            previousMaterials
          ) =>
            previousMaterials.filter(
              (item) =>
                String(
                  item._id
                ) !==
                String(
                  material._id
                )
            )
        );


        setSelectedMaterial(
          null
        );


        /*
         * Refresh once from backend
         * so UI always matches MongoDB.
         */

        try {
          const freshResponse =
            await api.get(
              "/materials"
            );


          setMaterials(
            freshResponse.data
              .materials ||
            []
          );

        } catch (
          refreshError
        ) {
          console.error(
            "Refresh after delete failed:",
            refreshError
          );
        }

      } catch (
        requestError
      ) {
        console.error(
          "Delete material error:",
          requestError.response
            ?.data ||
          requestError
        );


        const status =
          requestError.response
            ?.status;


        if (status === 401) {
          setError(
            "Your login session has expired. Please login again."
          );

        } else if (
          status === 404
        ) {
          setError(
            requestError.response
              ?.data?.message ||
            "Material was not found."
          );

        } else {
          setError(
            requestError.response
              ?.data?.message ||
            "Unable to delete material"
          );
        }

      } finally {
        setIsDeleting(false);
      }
    };


  return (
    <div className="materials-page">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="materials-background-art"
        aria-hidden="true"
      >

        <span
          className="
            materials-orbit
            materials-orbit-one
          "
        />

        <span
          className="
            materials-orbit
            materials-orbit-two
          "
        />


        <span
          className="
            materials-floating-icon
            materials-floating-book
          "
        >
          <BookOpen
            size={34}
          />
        </span>


        <span
          className="
            materials-floating-icon
            materials-floating-file
          "
        >
          <FileText
            size={32}
          />
        </span>


        <span
          className="
            materials-floating-icon
            materials-floating-brain
          "
        >
          <BrainCircuit
            size={31}
          />
        </span>


        <span
          className="
            materials-floating-icon
            materials-floating-question
          "
        >
          <FileQuestion
            size={30}
          />
        </span>


        <span
          className="
            materials-floating-icon
            materials-floating-cap
          "
        >
          <GraduationCap
            size={30}
          />
        </span>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="materials-content">

        {/* HEADER */}

        <header className="materials-header">

          <div>

            <p className="materials-eyebrow">
              Study Library
            </p>


            <h1>
              My{" "}
              <span>
                Materials
              </span>
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

            <Upload
              size={20}
            />

            Upload Material

          </Link>

        </header>


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="materials-toolbar">

          <div className="materials-search">

            <Search
              size={19}
            />


            <input
              type="search"

              value={
                search
              }

              onChange={(
                event
              ) =>
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
              value={
                typeFilter
              }

              onChange={
                setTypeFilter
              }

              ariaLabel="Filter by file type"

              options={[
                {
                  value:
                    "All",

                  label:
                    "All Types",
                },

                {
                  value:
                    "PDF",

                  label:
                    "PDF",
                },

                {
                  value:
                    "DOCX",

                  label:
                    "DOCX",
                },

                {
                  value:
                    "TXT",

                  label:
                    "Text",
                },
              ]}
            />

          </div>


          <div className="materials-filter">

            <ThemeSelect
              value={
                statusFilter
              }

              onChange={
                setStatusFilter
              }

              ariaLabel="Filter by status"

              options={[
                {
                  value:
                    "All",

                  label:
                    "All Status",
                },

                {
                  value:
                    "Ready",

                  label:
                    "Ready",
                },

                {
                  value:
                    "Processing",

                  label:
                    "Processing",
                },

                {
                  value:
                    "Failed",

                  label:
                    "Failed",
                },
              ]}
            />

          </div>


          <div className="materials-filter">

            <ThemeSelect
              value={
                sortOrder
              }

              onChange={
                setSortOrder
              }

              ariaLabel="Sort materials"

              options={[
                {
                  value:
                    "Newest",

                  label:
                    "Newest First",
                },

                {
                  value:
                    "Oldest",

                  label:
                    "Oldest First",
                },

                {
                  value:
                    "A-Z",

                  label:
                    "A-Z",
                },
              ]}
            />

          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="materials-error"
            role="alert"
          >
            {error}
          </div>

        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <section className="materials-empty">

            <Sparkles
              size={38}
            />

            <h2>
              Loading materials...
            </h2>


            <p>
              Please wait while
              your study library
              loads.
            </p>

          </section>

        ) : filteredMaterials.length ===
          0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <section className="materials-empty">

            <FileText
              size={42}
            />


            <h2>
              {search ||
              typeFilter !==
                "All" ||
              statusFilter !==
                "All"
                ? "No matching materials found"
                : "No materials uploaded yet"
              }
            </h2>


            <p>
              {search ||
              typeFilter !==
                "All" ||
              statusFilter !==
                "All"
                ? "Try changing your search or filters."
                : "Upload your first study material and start preparing with PrepMate."
              }
            </p>


            {!search &&
              typeFilter ===
                "All" &&
              statusFilter ===
                "All" && (

              <Link to="/upload">

                <Upload
                  size={17}
                />

                Upload Material

              </Link>

            )}

          </section>

        ) : (

          /* =================================================
             MATERIAL CARDS
          ================================================= */

          <section className="materials-grid">

            {filteredMaterials.map(
              (material) => {

                const fileType =
                  getFileType(
                    material
                  );


                const isPDF =
                  fileType.includes(
                    "PDF"
                  );


                const isDOCX =
                  fileType.includes(
                    "DOC"
                  );


                return (

                  <article
                    key={
                      material._id
                    }

                    className={`
                      material-card
                      ${
                        isDOCX
                          ? "material-card-blue"
                          : "material-card-purple"
                      }
                    `}
                  >

                    <FileText
                      className="material-decoration"
                      size={120}
                    />


                    {/* TOP */}

                    <div className="material-card-top">

                      <div
                        className={`
                          material-file-badge
                          ${
                            isPDF
                              ? "material-file-pdf"
                              : isDOCX
                                ? "material-file-docx"
                                : "material-file-other"
                          }
                        `}
                      >

                        {isPDF ||
                        isDOCX ? (

                          <FileText
                            size={23}
                          />

                        ) : (

                          <File
                            size={23}
                          />

                        )}


                        <span>
                          {fileType}
                        </span>

                      </div>


                      <span
                        className={`
                          material-status
                          material-status-${
                            material.status
                              ?.toLowerCase() ||
                            "uploaded"
                          }
                        `}
                      >

                        <span className="status-dot" />


                        {material.status ||
                          "Uploaded"
                        }

                      </span>

                    </div>


                    {/* BODY */}

                    <div className="material-card-body">

                      <h2>
                        {material.title ||
                          "Study Material"
                        }
                      </h2>


                      <p>
                        {material.originalFileName ||
                          "Uploaded study material"
                        }
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
                                  day:
                                    "numeric",

                                  month:
                                    "short",

                                  year:
                                    "numeric",
                                }
                              )
                            : "Recently"
                          }

                        </span>

                      </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="material-card-actions">

                      <button
                        type="button"

                        className="prepare-material-button"

                        disabled={
                          material.status !==
                          "Ready"
                        }

                        onClick={() =>
                          navigate(
                            `/prepare/${material._id}`
                          )
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

                        onClick={() =>
                          navigate(
                            `/prepare/${material._id}`
                          )
                        }

                        aria-label={
                          `Open ${material.title}`
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

                        disabled={
                          isDeleting
                        }

                        aria-label={
                          `Delete ${material.title}`
                        }
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


      {/* =================================================
          DOCK
      ================================================= */}

      <Dock
        items={
          dockItems
        }

        panelHeight={68}

        baseItemSize={50}

        magnification={70}

        distance={200}
      />


      {/* =================================================
          DELETE MODAL
      ================================================= */}

      <DeleteMaterialModal
        isOpen={
          Boolean(
            selectedMaterial
          )
        }

        material={
          selectedMaterial
        }

        isDeleting={
          isDeleting
        }

        onClose={() => {
          if (
            !isDeleting
          ) {
            setSelectedMaterial(
              null
            );
          }
        }}

        onConfirm={
          handleDelete
        }
      />

    </div>
  );
};


export default Materials;