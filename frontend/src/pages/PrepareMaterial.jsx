import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileQuestion,
  FileText,
  GraduationCap,
  MessageSquareText,
  Mic2,
  RefreshCw,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import gsap from "gsap";

import api from "../services/api";

import "../styles/prepareMaterial.css";

const PrepareMaterial = () => {
  const navigate = useNavigate();
  const { materialId } = useParams();

  const [material, setMaterial] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const cardRefs = useRef([]);

  const preparationModes = [
    {
      id: "mcq",
      mode: "MCQ",
      icon: FileQuestion,
      decoration: FileQuestion,
      title: "AI-Generated MCQs",
      description:
        "Generate multiple-choice questions with answers and explanations.",
      buttonLabel: "Start preparing",
      route:
        `/prepare/${materialId}/mcq`,
    },
    {
      id: "question-answer",
      mode: "QUESTION_ANSWER",
      icon: BookOpen,
      decoration: BookOpen,
      title: "Question & Answers",
      description:
        "Create important study questions with clear answers.",
      buttonLabel: "Start preparing",
      route:
        `/prepare/${materialId}/question-answer`,
    },
    {
      id: "interview",
      mode: "INTERVIEW",
      icon: MessageSquareText,
      decoration: MessageSquareText,
      title: "Interview Questions",
      description:
        "Prepare interview and viva questions from your material.",
      buttonLabel: "Start preparing",
      route:
        `/prepare/${materialId}/interview`,
    },
    {
      id: "virtual-interview",
      mode: "VIRTUAL_INTERVIEW",
      icon: Mic2,
      decoration: Mic2,
      title: "AI Virtual Interview",
      description:
        "Take a voice-based static or dynamic interview using this material.",
      buttonLabel: "Start interview",
      route:
        `/prepare/${materialId}/virtual-interview`,
    },
  ];

  const fetchMaterial =
    useCallback(async () => {
      if (!materialId) {
        setError(
          "Material ID is missing."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/materials/${materialId}`
        );

        const materialData =
          response.data?.material ||
          response.data;

        if (!materialData?._id) {
          throw new Error(
            "Material data was not found."
          );
        }

        setMaterial(materialData);
      } catch (requestError) {
        console.error(
          "Load material error:",
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
            "This study material was not found."
          );
        } else {
          setError(
            requestError.response?.data
              ?.message ||
            requestError.message ||
            "Unable to load study material."
          );
        }
      } finally {
        setLoading(false);
      }
    }, [materialId]);

  useEffect(() => {
    fetchMaterial();
  }, [fetchMaterial]);

  useEffect(() => {
    if (loading || !material) {
      return undefined;
    }

    const cards =
      cardRefs.current.filter(Boolean);

    if (!cards.length) {
      return undefined;
    }

    const animationContext =
      gsap.context(() => {
        cards.forEach(
          (wrapper, index) => {
            let rotation = 0;

            if (index === 0) {
              rotation = -4;
            }

            if (index === 1) {
              rotation = 2;
            }

            if (index === 2) {
              rotation = -2;
            }

            if (index === 3) {
              rotation = 4;
            }

            gsap.fromTo(
              wrapper,
              {
                y: 120,
                opacity: 0,
                scale: 0.84,
                rotation,
              },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.9,
                delay: index * 0.14,
                ease: "back.out(1.7)",
              }
            );
          }
        );
      });

    return () => {
      animationContext.revert();
    };
  }, [loading, material]);

  const openPreparation = (
    preparation
  ) => {
    if (!material?._id) {
      setError(
        "Material information is missing."
      );
      return;
    }

    if (
      material.status &&
      material.status !== "Ready"
    ) {
      setError(
        "This material is not ready for preparation yet."
      );
      return;
    }

    navigate(preparation.route, {
      state: {
        material,
        preparationMode:
          preparation.mode,
      },
    });
  };

  const goBack = () => {
    navigate("/materials");
  };

  if (loading) {
    return (
      <div className="prepare-page">
        <div className="prepare-state">
          <div
            className="prepare-loader"
            aria-hidden="true"
          />

          <p>Loading material...</p>
        </div>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="prepare-page">
        <div className="prepare-state">
          <p
            className="prepare-error"
            role="alert"
          >
            {error}
          </p>

          <div className="prepare-state-actions">
            <button
              type="button"
              onClick={fetchMaterial}
            >
              <RefreshCw size={17} />
              Try again
            </button>

            <button
              type="button"
              onClick={goBack}
            >
              <ArrowLeft size={17} />
              Back to materials
            </button>
          </div>
        </div>
      </div>
    );
  }

  const materialTitle =
    material?.title ||
    "Study Material";

  const materialFileName =
    material?.originalFileName ||
    "Uploaded study material";

  const materialFileType =
    material?.fileType
      ? String(material.fileType)
        .replace(".", "")
        .toUpperCase()
      : "";

  return (
    <div className="prepare-page">
      <div
        className="prepare-background-art"
        aria-hidden="true"
      >
        <span className="prepare-orbit prepare-orbit-one" />
        <span className="prepare-orbit prepare-orbit-two" />

        <span className="prepare-floating-study-icon prepare-study-icon-one">
          <FileQuestion size={29} />
        </span>

        <span className="prepare-floating-study-icon prepare-study-icon-two">
          <GraduationCap size={33} />
        </span>

        <span className="prepare-floating-study-icon prepare-study-icon-three">
          <BookOpen size={29} />
        </span>

        <span className="prepare-floating-study-icon prepare-study-icon-four">
          <MessageSquareText size={28} />
        </span>

        <span className="prepare-floating-study-icon prepare-study-icon-five">
          <Mic2 size={25} />
        </span>
      </div>

      <div className="prepare-container">
        <button
          type="button"
          className="prepare-back-button"
          onClick={goBack}
        >
          <ArrowLeft size={18} />
          <span>My materials</span>
        </button>

        <header className="prepare-header">
          <span className="prepare-eyebrow">
            Choose preparation mode
          </span>

          <div className="prepare-material-heading">
            <div className="prepare-file-icon">
              <FileText size={30} />
            </div>

            <div className="prepare-material-info">
              <h1>{materialTitle}</h1>

              <p>
                {materialFileName}

                {materialFileType && (
                  <>
                    {" · "}
                    {materialFileType}
                  </>
                )}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div
            className="prepare-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="prepare-cards">
          {preparationModes.map(
            (preparation, index) => {
              const Icon =
                preparation.icon;

              const Decoration =
                preparation.decoration;

              return (
                <div
                  key={preparation.id}
                  className={`
                    prepare-card-bounce
                    prepare-card-bounce-${index + 1}
                  `}
                  ref={(element) => {
                    cardRefs.current[index] =
                      element;
                  }}
                >
                  <article
                    className={`
                      prepare-mode-card
                      prepare-mode-card-${index + 1}
                    `}
                  >
                    <div
                      className="prepare-card-glow"
                      aria-hidden="true"
                    />

                    <div
                      className="prepare-card-decoration"
                      aria-hidden="true"
                    >
                      <Decoration size={128} />
                    </div>

                    <div className="prepare-mode-icon">
                      <Icon size={27} />
                    </div>

                    <div className="prepare-card-content">
                      <h2>
                        {preparation.title}
                      </h2>

                      <p>
                        {
                          preparation.description
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      className="prepare-start-button"
                      onClick={() =>
                        openPreparation(
                          preparation
                        )
                      }
                    >
                      <span>
                        {
                          preparation.buttonLabel
                        }
                      </span>

                      <span className="prepare-start-arrow">
                        <ArrowRight size={19} />
                      </span>
                    </button>
                  </article>
                </div>
              );
            }
          )}
        </section>
      </div>
    </div>
  );
};

export default PrepareMaterial;