import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileQuestion,
  FileText,
  GraduationCap,
  MessageSquareText,
} from "lucide-react";

import {
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


  /* =====================================================
     PREPARATION MODES
  ===================================================== */

  const preparationModes = [
    {
      id: "mcq",

      mode: "MCQ",

      icon: FileQuestion,

      decoration: FileQuestion,

      title: "AI-Generated MCQs",

      description:
        "Generate multiple-choice questions with answers and explanations.",

      route:
        `/materials/${materialId}/mcq`,
    },

    {
      id: "question-answer",

      mode: "QUESTION_ANSWER",

      icon: BookOpen,

      decoration: BookOpen,

      title: "Question & Answers",

      description:
        "Create important study questions with clear answers.",

      route:
        `/materials/${materialId}/question-answer`,
    },

    {
      id: "interview",

      mode: "INTERVIEW",

      icon: MessageSquareText,

      decoration: MessageSquareText,

      title: "Interview Questions",

      description:
        "Prepare interview and viva questions from your material.",

      route:
        `/materials/${materialId}/interview`,
    },
  ];


  /* =====================================================
     FETCH MATERIAL
  ===================================================== */

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await api.get(
          `/materials/${materialId}`
        );

        const materialData =
          response.data?.material ||
          response.data;

        setMaterial(materialData);

      } catch (requestError) {
        setError(
          requestError.response?.data
            ?.message ||
          "Unable to load study material."
        );

      } finally {
        setLoading(false);
      }
    };


    if (materialId) {
      fetchMaterial();
    }

  }, [materialId]);


  /* =====================================================
     CARD BOUNCE ENTRANCE
  ===================================================== */

  useEffect(() => {
    if (loading || !material) {
      return;
    }

    const cards =
      cardRefs.current.filter(Boolean);

    if (!cards.length) {
      return;
    }


    const ctx = gsap.context(() => {
      cards.forEach(
        (wrapper, index) => {
          let rotation = 0;

          if (index === 0) {
            rotation = -5;
          }

          if (index === 2) {
            rotation = 5;
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

              delay:
                index * 0.14,

              ease:
                "back.out(1.7)",
            }
          );
        }
      );
    });


    return () => {
      ctx.revert();
    };

  }, [loading, material]);


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const openPreparation = (
    preparation
  ) => {
    navigate(
      preparation.route,
      {
        state: {
          material,

          preparationMode:
            preparation.mode,
        },
      }
    );
  };


  const goBack = () => {
    navigate("/materials");
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="prepare-page">

        <div className="prepare-state">

          <div className="prepare-loader" />

          <p>
            Loading material...
          </p>

        </div>

      </div>
    );
  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="prepare-page">

        <div className="prepare-state">

          <p className="prepare-error">
            {error}
          </p>

          <button
            type="button"
            onClick={goBack}
          >
            Back to materials
          </button>

        </div>

      </div>
    );
  }


  return (
    <div className="prepare-page">

      {/* =================================================
          PAGE BACKGROUND DECORATION

          IMPORTANT:
          Ye cards ke andar nahi hai.
          Pura page background mein float karega.
      ================================================= */}

      <div className="prepare-background-art">

        {/* orbital lines */}

        <span className="prepare-orbit prepare-orbit-one" />

        <span className="prepare-orbit prepare-orbit-two" />


        {/* left question icon */}

        <span
          className="
            prepare-floating-study-icon
            prepare-study-icon-one
          "
        >
          <FileQuestion size={29} />
        </span>


        {/* right graduation cap */}

        <span
          className="
            prepare-floating-study-icon
            prepare-study-icon-two
          "
        >
          <GraduationCap size={33} />
        </span>


        {/* bottom-left book */}

        <span
          className="
            prepare-floating-study-icon
            prepare-study-icon-three
          "
        >
          <BookOpen size={29} />
        </span>


        {/* right chat icon */}

        <span
          className="
            prepare-floating-study-icon
            prepare-study-icon-four
          "
        >
          <MessageSquareText size={28} />
        </span>


        {/* additional graduation icon */}

        <span
          className="
            prepare-floating-study-icon
            prepare-study-icon-five
          "
        >
          <GraduationCap size={25} />
        </span>

      </div>


      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <div className="prepare-container">

        {/* ================= BACK ================= */}

        <button
          type="button"
          className="prepare-back-button"
          onClick={goBack}
        >

          <ArrowLeft size={18} />

          <span>
            My materials
          </span>

        </button>


        {/* =================================================
            MATERIAL HEADER
        ================================================= */}

        <header className="prepare-header">

          <span className="prepare-eyebrow">
            Choose preparation mode
          </span>


          <div className="prepare-material-heading">

            <div className="prepare-file-icon">

              <FileText size={30} />

            </div>


            <div className="prepare-material-info">

              <h1>
                {material?.title ||
                  material?.name ||
                  "Study Material"}
              </h1>


              <p>
                {material?.fileName ||
                  material?.originalName ||
                  material?.title ||
                  "Study material"}

                {material?.fileType && (
                  <>
                    {" "}
                    ·
                    {" "}

                    {String(
                      material.fileType
                    ).replace(".", "")}
                  </>
                )}
              </p>

            </div>

          </div>

        </header>


        {/* =================================================
            PREPARATION CARDS
        ================================================= */}

        <section className="prepare-cards">

          {preparationModes.map(
            (
              preparation,
              index
            ) => {

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

                    {/* card glow */}

                    <div
                      className="prepare-card-glow"
                    />


                    {/* large faded card icon */}

                    <div
                      className="prepare-card-decoration"
                    >
                      <Decoration
                        size={128}
                      />
                    </div>


                    {/* main icon */}

                    <div className="prepare-mode-icon">

                      <Icon size={27} />

                    </div>


                    {/* text */}

                    <div className="prepare-card-content">

                      <h2>
                        {preparation.title}
                      </h2>


                      <p>
                        {preparation.description}
                      </p>

                    </div>


                    {/* start */}

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
                        Start preparing
                      </span>


                      <span className="prepare-start-arrow">

                        <ArrowRight
                          size={19}
                        />

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