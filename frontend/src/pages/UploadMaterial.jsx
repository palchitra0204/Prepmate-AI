import {
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  FileQuestion,
  FileText,
  GraduationCap,
  HelpCircle,
  LockKeyhole,
  Presentation,
  Sparkles,
  Upload,
  UploadCloud,
  X,
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

import "../styles/UploadMaterial.css";


const maximumFileSize =
  10 * 1024 * 1024;


const allowedExtensions = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "ppt",
  "pptx",
];


const createFileId = (
  file,
  index
) =>
  `${file.name}-${file.size}-${file.lastModified}-${index}`;


const getFileExtension = (
  fileName
) =>
  fileName
    .split(".")
    .pop()
    ?.toLowerCase() || "";


const getMaterialTitle = (
  fileName
) =>
  fileName.replace(
    /\.[^/.]+$/,
    ""
  );


const formatFileSize = (
  size
) => {
  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }


  return `${(
    size /
    (1024 * 1024)
  ).toFixed(2)} MB`;
};


const UploadMaterial = () => {
  const navigate = useNavigate();

  const fileInputRef =
    useRef(null);


  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState([]);


  const [
    isDragging,
    setIsDragging,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /* =====================================================
     DOCK
  ===================================================== */

  const dockItems = [
    {
      icon:
        <VscHome size={20} />,

      label: "Dashboard",

      onClick: () =>
        navigate("/dashboard"),
    },

    {
      icon:
        <VscArchive size={20} />,

      label: "Materials",

      onClick: () =>
        navigate("/materials"),
    },

    {
      icon:
        <VscHistory size={20} />,

      label: "History",

      onClick: () =>
        navigate("/history"),
    },

    {
      icon:
        <VscCommentDiscussion
          size={20}
        />,

      label: "Chat",

      onClick: () =>
        navigate("/dashboard"),
    },
  ];


  /* =====================================================
     UPDATE FILE
  ===================================================== */

  const updateFile = (
    fileId,
    changes
  ) => {
    setSelectedFiles(
      (previousFiles) =>
        previousFiles.map(
          (selectedFile) =>
            selectedFile.id === fileId
              ? {
                ...selectedFile,
                ...changes,
              }
              : selectedFile
        )
    );
  };


  /* =====================================================
     VALIDATE FILES
  ===================================================== */

  const validateAndAddFiles = (
    fileList
  ) => {
    const incomingFiles =
      Array.from(
        fileList || []
      );


    if (
      incomingFiles.length === 0
    ) {
      return;
    }


    const validFiles = [];

    const validationErrors = [];


    incomingFiles.forEach(
      (file, index) => {
        const extension =
          getFileExtension(
            file.name
          );


        if (
          !allowedExtensions.includes(
            extension
          )
        ) {
          validationErrors.push(
            `${file.name}: Unsupported file type`
          );

          return;
        }


        if (
          file.size >
          maximumFileSize
        ) {
          validationErrors.push(
            `${file.name}: File is larger than 10 MB`
          );

          return;
        }


        validFiles.push({
          id: createFileId(
            file,
            index
          ),

          file,

          title:
            getMaterialTitle(
              file.name
            ),

          extension,

          progress: 0,

          status: "Ready",

          uploadError: "",
        });
      }
    );


    setSelectedFiles(
      (previousFiles) => {
        const newFiles =
          validFiles.filter(
            (newFile) =>
              !previousFiles.some(
                (existingFile) =>
                  existingFile.file
                    .name ===
                  newFile.file
                    .name &&

                  existingFile.file
                    .size ===
                  newFile.file
                    .size &&

                  existingFile.file
                    .lastModified ===
                  newFile.file
                    .lastModified
              )
          );


        return [
          ...previousFiles,
          ...newFiles,
        ];
      }
    );


    setError(
      validationErrors.join(
        " "
      )
    );


    setSuccess("");


    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };


  /* =====================================================
     FILE CHANGE
  ===================================================== */

  const handleFileChange = (
    event
  ) => {
    validateAndAddFiles(
      event.target.files
    );
  };


  /* =====================================================
     DRAG EVENTS
  ===================================================== */

  const handleDragEnter = (
    event
  ) => {
    event.preventDefault();

    setIsDragging(true);
  };


  const handleDragOver = (
    event
  ) => {
    event.preventDefault();

    setIsDragging(true);
  };


  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();


    if (
      event.currentTarget ===
      event.target
    ) {
      setIsDragging(false);
    }
  };


  const handleDrop = (
    event
  ) => {
    event.preventDefault();

    setIsDragging(false);


    validateAndAddFiles(
      event.dataTransfer.files
    );
  };


  /* =====================================================
     REMOVE FILE
  ===================================================== */

  const removeFile = (
    fileId
  ) => {
    if (loading) {
      return;
    }


    setSelectedFiles(
      (previousFiles) =>
        previousFiles.filter(
          (selectedFile) =>
            selectedFile.id !==
            fileId
        )
    );


    setError("");

    setSuccess("");
  };


  /* =====================================================
     UPLOAD
  ===================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();


    if (
      selectedFiles.length === 0
    ) {
      setError(
        "Please select at least one file"
      );

      return;
    }


    try {
      setLoading(true);

      setError("");

      setSuccess("");


      let uploadedCount = 0;

      let lastMaterialId =
        null;


      for (
        const selectedFile of
        selectedFiles
      ) {
        updateFile(
          selectedFile.id,
          {
            status:
              "Uploading",

            progress: 0,

            uploadError: "",
          }
        );


        const formData =
          new FormData();


        formData.append(
          "title",
          selectedFile.title
        );


        formData.append(
          "file",
          selectedFile.file
        );


        try {
          const response =
            await api.post(
              "/materials/upload",

              formData,

              {
                headers: {
                  "Content-Type":
                    "multipart/form-data",
                },


                onUploadProgress: (
                  progressEvent
                ) => {
                  const total =
                    progressEvent.total ||
                    selectedFile.file
                      .size;


                  const progress =
                    Math.round(
                      (
                        progressEvent.loaded *
                        100
                      ) /
                      total
                    );


                  updateFile(
                    selectedFile.id,
                    {
                      progress,
                    }
                  );
                },
              }
            );


          lastMaterialId =
            response.data
              .material?.id ||

            response.data
              .material?._id ||

            lastMaterialId;


          uploadedCount += 1;


          updateFile(
            selectedFile.id,
            {
              status:
                "Uploaded",

              progress:
                100,
            }
          );

        } catch (
        uploadRequestError
        ) {
          updateFile(
            selectedFile.id,
            {
              status:
                "Failed",

              uploadError:
                uploadRequestError
                  .response?.data
                  ?.message ||

                "Upload failed",
            }
          );
        }
      }


      if (
        uploadedCount ===
        selectedFiles.length
      ) {
        setSuccess(
          `${uploadedCount} ${uploadedCount === 1
            ? "file"
            : "files"
          } uploaded successfully`
        );


        window.setTimeout(
          () => {
            if (
              uploadedCount === 1 &&
              lastMaterialId
            ) {
              navigate(
                `/prepare/${lastMaterialId}`
              );

            } else {
              navigate(
                "/materials"
              );
            }
          },

          900
        );

      } else if (
        uploadedCount > 0
      ) {
        setError(
          `${uploadedCount} file uploaded, but some files failed`
        );

      } else {
        setError(
          "Files could not be uploaded. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="upload-page">

      {/* =================================================
          BACKGROUND ART
      ================================================= */}

      <div
        className="upload-background-art"
        aria-hidden="true"
      >

        {/* Orbits */}

        <span
          className="
            upload-background-orbit
            upload-background-orbit-one
          "
        />

        <span
          className="
            upload-background-orbit
            upload-background-orbit-two
          "
        />


        {/* Book */}

        <span
          className="
            upload-floating-study-icon
            upload-floating-book
          "
        >
          <BookOpen size={31} />
        </span>


        {/* Graduation */}

        <span
          className="
            upload-floating-study-icon
            upload-floating-cap
          "
        >
          <GraduationCap
            size={33}
          />
        </span>


        {/* Question */}

        <span
          className="
            upload-floating-study-icon
            upload-floating-question
          "
        >
          <FileQuestion
            size={29}
          />
        </span>


        {/* Brain */}

        <span
          className="
            upload-floating-study-icon
            upload-floating-brain
          "
        >
          <BrainCircuit
            size={29}
          />
        </span>


        {/* Bottom book */}

        <span
          className="
            upload-floating-study-icon
            upload-floating-book-two
          "
        >
          <BookOpen size={28} />
        </span>


        {/* Decorative sparkles */}

        <Sparkles
          className="
            upload-background-sparkle
            upload-sparkle-one
          "
          size={23}
        />

        <Sparkles
          className="
            upload-background-sparkle
            upload-sparkle-two
          "
          size={18}
        />

      </div>


      {/* =================================================
          BACK TO MATERIALS
      ================================================= */}

      <button
        type="button"
        className="upload-back-button"
        onClick={() =>
          navigate("/materials")
        }
      >

        <ArrowLeft size={19} />

        <span>
          My materials
        </span>

      </button>


      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <main className="upload-content">

        <div className="upload-page-inner">

          {/* ===============================================
              PAGE HEADER
          =============================================== */}

          <header className="upload-page-header">

            <span className="upload-page-eyebrow">
              Upload material
            </span>


            <h1>
              Add New{" "}

              <span>
                Material
              </span>
            </h1>


            <p>
              Upload your study material
              to generate MCQs, Q&amp;A,
              interview preparation and
              more.
            </p>

          </header>


          {/* ===============================================
              UPLOAD PANEL
          =============================================== */}

          <form
            className="upload-panel"
            onSubmit={
              handleSubmit
            }
          >

            {/* Error */}

            {error && (
              <div
                className="
                  upload-message
                  upload-error
                "
              >
                {error}
              </div>
            )}


            {/* Success */}

            {success && (
              <div
                className="
                  upload-message
                  upload-success
                "
              >

                <CheckCircle2
                  size={18}
                />

                {success}

              </div>
            )}


            {/* ===========================================
                DROP AREA
            =========================================== */}

            <div
              className={`
                upload-dropzone
                ${isDragging
                  ? "upload-dropzone-active"
                  : ""
                }
              `}

              onDragEnter={
                handleDragEnter
              }

              onDragOver={
                handleDragOver
              }

              onDragLeave={
                handleDragLeave
              }

              onDrop={
                handleDrop
              }

              onClick={() =>
                fileInputRef.current
                  ?.click()
              }

              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter" ||
                  event.key ===
                  " "
                ) {
                  event.preventDefault();

                  fileInputRef.current
                    ?.click();
                }
              }}

              role="button"

              tabIndex={0}
            >

              <input
                ref={
                  fileInputRef
                }

                type="file"

                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"

                onChange={
                  handleFileChange
                }

                multiple

                hidden
              />


              {/* =======================================
                  OPTION 2 FILE BOX ILLUSTRATION
              ======================================= */}

              <div className="upload-box-illustration">

                <div className="upload-box-back" />


                <div
                  className="
                    upload-demo-file
                    upload-demo-pdf
                  "
                >

                  <FileText
                    size={24}
                  />

                  <span>
                    PDF
                  </span>

                </div>


                <div
                  className="
                    upload-demo-file
                    upload-demo-docx
                  "
                >

                  <FileText
                    size={24}
                  />

                  <span>
                    DOCX
                  </span>

                </div>


                <div
                  className="
                    upload-demo-file
                    upload-demo-txt
                  "
                >

                  <FileText
                    size={24}
                  />

                  <span>
                    TXT
                  </span>

                </div>


                <div
                  className="
                    upload-demo-file
                    upload-demo-pptx
                  "
                >

                  <Presentation
                    size={24}
                  />

                  <span>
                    PPTX
                  </span>

                </div>


                <div className="upload-box-front-left" />

                <div className="upload-box-front-right" />


                <Sparkles
                  className="upload-illustration-sparkle upload-illustration-sparkle-one"
                  size={18}
                />


                <Sparkles
                  className="upload-illustration-sparkle upload-illustration-sparkle-two"
                  size={15}
                />

              </div>


              <h2>
                Drop Your Files Here
              </h2>


              <p className="upload-dropzone-description">
                Upload notes, PDFs,
                documents or presentations
                to get started.
              </p>


              {/* File types */}

              <div className="upload-format-list">

                <span>
                  PDF
                </span>

                <span>
                  DOCX
                </span>

                <span>
                  TXT
                </span>

                <span>
                  PPTX
                </span>

                <span className="upload-size-pill">
                  Max 10MB
                </span>

              </div>


              {/* Choose file */}

              <button
                type="button"
                className="upload-choose-file-button"

                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  fileInputRef.current
                    ?.click();
                }}
              >

                <Upload size={18} />

                Choose File

              </button>


              {/* Security */}

              <div className="upload-security">

                <LockKeyhole
                  size={15}
                />

                <span>
                  Your files are safe
                  and secure
                </span>

              </div>

            </div>


            {/* ===========================================
                REQUIREMENTS
            =========================================== */}

            <div className="upload-requirements">

              <span>
                Accepted: PDF, DOC,
                DOCX, TXT, PPT, PPTX
              </span>


              <span>
                Maximum file size:
                10 MB
              </span>

            </div>


            {/* ===========================================
                SELECTED FILES
            =========================================== */}

            {selectedFiles.length >
              0 && (

                <div className="selected-files-list">

                  {selectedFiles.map(
                    (
                      selectedFile
                    ) => (

                      <div
                        key={
                          selectedFile.id
                        }

                        className={`
                        selected-upload-file
                        selected-file-${selectedFile.status.toLowerCase()}
                      `}
                      >

                        {/* File icon */}

                        <div
                          className={`
                          selected-file-icon
                          file-type-${selectedFile.extension}
                        `}
                        >

                          {[
                            "ppt",
                            "pptx",
                          ].includes(
                            selectedFile.extension
                          )
                            ? (
                              <Presentation
                                size={21}
                              />
                            )
                            : (
                              <FileText
                                size={21}
                              />
                            )
                          }


                          <small>
                            {selectedFile.extension.toUpperCase()}
                          </small>

                        </div>


                        {/* File details */}

                        <div className="selected-file-details">

                          <div className="selected-file-heading">

                            <strong>
                              {
                                selectedFile
                                  .file
                                  .name
                              }
                            </strong>


                            <span>

                              {formatFileSize(
                                selectedFile
                                  .file
                                  .size
                              )}

                              {" · "}

                              {
                                selectedFile.status
                              }

                            </span>

                          </div>


                          <div className="file-progress-track">

                            <span
                              style={{
                                width:
                                  `${selectedFile.status ===
                                    "Ready"
                                    ? 0
                                    : selectedFile.progress
                                  }%`,
                              }}
                            />

                          </div>


                          {selectedFile.uploadError && (

                            <small className="selected-file-error">

                              {
                                selectedFile.uploadError
                              }

                            </small>

                          )}

                        </div>


                        {/* Remove */}

                        <button
                          type="button"

                          className="remove-upload-file"

                          onClick={() =>
                            removeFile(
                              selectedFile.id
                            )
                          }

                          disabled={
                            loading
                          }

                          aria-label={
                            `Remove ${selectedFile.file.name}`
                          }
                        >

                          <X size={18} />

                        </button>

                      </div>

                    )
                  )}

                </div>

              )}


            {/* ===========================================
                ACTIONS
            =========================================== */}

            <div className="upload-panel-actions">

              <div className="upload-main-actions">

                <button
                  type="submit"

                  className="upload-submit-button"

                  disabled={
                    loading ||
                    selectedFiles.length ===
                    0
                  }
                >

                  {loading
                    ? "Uploading..."
                    : "Upload & Continue"
                  }


                  {!loading && (
                    <ArrowRight
                      size={18}
                    />
                  )}

                </button>


                <button
                  type="button"

                  className="upload-cancel-button"

                  onClick={() =>
                    navigate(
                      "/materials"
                    )
                  }

                  disabled={
                    loading
                  }
                >

                  Cancel

                </button>

              </div>


              <button
                type="button"

                className="upload-help-button"

                onClick={() =>
                  setError(
                    "Select PDF, DOC, DOCX, TXT, PPT or PPTX files up to 10 MB each."
                  )
                }
              >

                <HelpCircle
                  size={17}
                />

                Help

              </button>

            </div>

          </form>

        </div>

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

    </div>
  );
};


export default UploadMaterial;