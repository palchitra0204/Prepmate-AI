import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  FileText,
  History,
  Home,
  Library,
  Menu,
  MessageSquareText,
  Moon,
  Palette,
  Sun,
  Sparkles,
  Settings,
  Upload,
  X,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import { useTheme } from "../context/ThemeContext";

import Dock from "../components/Dock";
import Galaxy from "../components/Galaxy";
import ShinyText from "../components/ShinyText";
import BounceCards from "../components/BounceCards";

import "../styles/landingPage.css";

gsap.registerPlugin(ScrollTrigger);


const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Material",
    description:
      "Upload a PDF or DOCX file, or paste your study content directly.",
  },

  {
    number: "02",
    icon: BrainCircuit,
    title: "AI Analyses Content",
    description:
      "PrepMate AI reads and understands the important topics in your material.",
  },

  {
    number: "03",
    icon: Sparkles,
    title: "Start Preparation",
    description:
      "Generate MCQs, question-answers, interview questions or start a Virtual Viva.",
  },
];


const LandingPage = () => {
  const navigate = useNavigate();

  const { theme, changeTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);

  const [showIntro, setShowIntro] = useState(true);


  /* =====================================================
     BOUNCE REFERENCES
  ===================================================== */

  const processSectionRef = useRef(null);

  const stepBounceRefs = useRef([]);

  const ctaBounceRef = useRef(null);


  /* =====================================================
     INTRO TIMER
  ===================================================== */

  useEffect(() => {
    const introTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, 6000);

    return () => {
      window.clearTimeout(introTimer);
    };
  }, []);


  /* =====================================================
     SCROLL BOUNCE
  ===================================================== */

  useEffect(() => {
    const ctx = gsap.context(() => {

      /*
       * HOW IT WORKS CARDS
       *
       * Important:
       * wrapper animate ho raha hai,
       * .step-card directly nahi.
       *
       * Isliye existing CSS floating animation
       * conflict nahi karegi.
       */

      stepBounceRefs.current.forEach((wrapper, index) => {
        if (!wrapper) return;

        let startRotate = 0;

        if (index === 0) {
          startRotate = -5;
        }

        if (index === 2) {
          startRotate = 5;
        }


        gsap.fromTo(
          wrapper,

          {
            y: 120,
            opacity: 0,
            scale: 0.88,
            rotation: startRotate,
          },

          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: 0,

            duration: 0.95,

            delay: index * 0.12,

            ease: "back.out(1.7)",

            scrollTrigger: {
              trigger: wrapper,

              start: "top 88%",

              toggleActions:
                "play none none reverse",
            },
          }
        );
      });


      /*
       * READY TO STUDY SMARTER CARD
       */

      if (ctaBounceRef.current) {

        gsap.fromTo(
          ctaBounceRef.current,

          {
            y: 130,
            opacity: 0,
            scale: 0.88,
            rotation: 3,
          },

          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: 0,

            duration: 1,

            ease: "back.out(1.7)",

            scrollTrigger: {
              trigger: ctaBounceRef.current,

              start: "top 88%",

              toggleActions:
                "play none none reverse",
            },
          }
        );
      }

    }, processSectionRef);


    /*
     * Layout complete hone ke baad
     * ScrollTrigger positions refresh
     */

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);


    return () => {
      window.clearTimeout(refreshTimer);

      ctx.revert();
    };

  }, []);


  /* =====================================================
     SCROLL TO SECTION
  ===================================================== */

  const scrollToSection = (sectionId) => {

    const section =
      document.getElementById(sectionId);


    if (section) {

      section.scrollIntoView({
        behavior: "smooth",
      });

    }


    setMenuOpen(false);
  };


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const openLogin = () => {

    setMenuOpen(false);

    navigate("/login");
  };


  const openRegister = () => {

    setMenuOpen(false);

    navigate("/register");
  };


  /* =====================================================
     DOCK
  ===================================================== */

  const dockItems = [

    {
      label: "Home",

      icon: <Home size={21} />,

      onClick: () =>
        scrollToSection("home"),
    },


    {
      label: "Upload",

      icon: <Upload size={21} />,

      onClick: () =>
        navigate("/upload"),
    },


    {
      label: "Materials",

      icon: <Library size={21} />,

      onClick: () =>
        navigate("/materials"),
    },


    {
      label: "History",

      icon: <History size={21} />,

      onClick: () =>
        navigate("/history"),
    },


    {
      label: "Chat",

      icon:
        <MessageSquareText size={21} />,

      onClick: () =>
        navigate(
          "/dashboard",
          {
            state: {
              focusChat: true,
            },
          }
        ),
    },


    {
      label: "Settings",

      icon:
        <Settings size={21} />,

      onClick: () =>
        navigate("/settings"),
    },

  ];


  return (

    <div
      className={`landing-page landing-${theme}`}
    >

      {/* =================================================
          INTRO
      ================================================= */}

      {showIntro && (

        <div
          className="landing-intro"
          role="status"
          aria-label="Loading PrepMate AI"
        >

          <Galaxy
            className="landing-intro-particles"
            mouseRepulsion
            mouseInteraction
            density={1.5}
            glowIntensity={0.5}
            saturation={0.9}
            hueShift={240}
            twinkleIntensity={0.55}
            rotationSpeed={0.08}
            transparent
          />


          <span
            className="
              landing-intro-galaxy-orbit
              landing-intro-galaxy-orbit-one
            "
          />


          <span
            className="
              landing-intro-galaxy-orbit
              landing-intro-galaxy-orbit-two
            "
          />


          <div className="landing-intro-content">

            <div className="landing-intro-brand">

              <div className="landing-intro-logo">

                <BrainCircuit size={39} />

              </div>


              <ShinyText
                text="PrepMate AI"
                speed={1.4}
                color="#a66cff"
                shineColor="#ffffff"
                spread={115}
                className="landing-intro-text"
              />

            </div>


            <span
              className="landing-intro-line"
            />


            <span
              className="landing-intro-tagline"
            >
              Smarter practice. Brighter results.
            </span>

          </div>

        </div>

      )}


      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">

        <div className="container navbar-content">

          <button
            className="logo"
            onClick={() =>
              scrollToSection("home")
            }
          >

            <div className="logo-icon">

              <BrainCircuit size={24} />

            </div>


            <span>
              PrepMate <strong>AI</strong>
            </span>

          </button>


          <nav
            className={
              `nav-links ${menuOpen
                ? "nav-open"
                : ""
              }`
            }
          >

            <button
              onClick={() =>
                scrollToSection("home")
              }
            >
              Home
            </button>


            <button
              onClick={() =>
                scrollToSection("features")
              }
            >
              Features
            </button>


            <button
              onClick={() =>
                scrollToSection(
                  "how-it-works"
                )
              }
            >
              How It Works
            </button>


            <button
              onClick={() =>
                scrollToSection("about")
              }
            >
              About
            </button>


            {/* Appearance */}

            <div className="nav-appearance">

              <div
                className="nav-appearance-title"
              >

                <Palette size={17} />

                <span>
                  Appearance
                </span>

              </div>


              <div
                className="nav-theme-options"
              >

                <button
                  type="button"
                  className={
                    theme === "light"
                      ? "nav-theme-button nav-theme-active"
                      : "nav-theme-button"
                  }
                  onClick={() =>
                    changeTheme("light")
                  }
                >

                  <Sun size={17} />

                  Light

                </button>


                <button
                  type="button"
                  className={
                    theme === "dark"
                      ? "nav-theme-button nav-theme-active"
                      : "nav-theme-button"
                  }
                  onClick={() =>
                    changeTheme("dark")
                  }
                >

                  <Moon size={17} />

                  Dark

                </button>

              </div>

            </div>


            <button
              className="mobile-login-button"
              onClick={openLogin}
            >
              Login
            </button>


            <button
              className="mobile-get-started-button"
              onClick={openRegister}
            >

              Get Started

              <ArrowRight size={17} />

            </button>

          </nav>


          <div className="nav-actions">

            <button
              className="login-button"
              onClick={openLogin}
            >
              Login
            </button>


            <button
              className="get-started-button"
              onClick={openRegister}
            >

              Get Started

              <ArrowRight size={17} />

            </button>

          </div>


          <button
            className="menu-button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle navigation menu"
          >

            {menuOpen
              ? <X />
              : <Menu />
            }

          </button>

        </div>

      </header>


      {/* =================================================
          HERO
      ================================================= */}

      <main
        id="home"
        className="hero-section"
      >

        {/* Hero Logo */}

        <button
          type="button"
          className="hero-logo"
          onClick={() =>
            scrollToSection("home")
          }
          aria-label="PrepMate AI home"
        >

          <span className="hero-logo-icon">

            <BrainCircuit size={23} />

          </span>


          <span>

            PrepMate{" "}

            <strong>
              AI
            </strong>

          </span>

        </button>


        {/* Background */}

        <div
          className="
            hero-blur
            hero-blur-one
          "
        />


        <div
          className="
            hero-blur
            hero-blur-two
          "
        />


        <div
          className="hero-grid-pattern"
        />


        <div
          className="
            container
            hero-content
          "
        >

          {/* =============================
              HERO LEFT
          ============================= */}

          <div className="hero-text">

            <div className="hero-badge">

              <Sparkles size={16} />

              AI-powered learning assistant

            </div>


            <h1>

              Turn your study material into

              <span>
                {" "}smart preparation
              </span>

            </h1>


            <p>

              Upload your PDF, DOCX or text
              and let PrepMate AI generate
              MCQs, question-answers,
              interview questions and
              personalised preparation
              content.

            </p>


            <div className="hero-buttons">

              <button
                className="primary-button"
                onClick={openRegister}
              >

                Start Preparing

                <ArrowRight size={19} />

              </button>


              <button
                className="secondary-button"
                onClick={() =>
                  scrollToSection(
                    "how-it-works"
                  )
                }
              >
                See How It Works
              </button>

            </div>


            <div className="hero-points">

              <span>

                <CheckCircle2 size={17} />

                Content-based questions

              </span>


              <span>

                <CheckCircle2 size={17} />

                Instant AI results

              </span>


              <span>

                <CheckCircle2 size={17} />

                Personalised preparation

              </span>

            </div>

          </div>


          {/* =============================
              HERO RIGHT
          ============================= */}

          <div className="hero-visual">

            <span
              className="
                orbit-document
                orbit-document-left
              "
            >

              <FileText size={25} />

            </span>


            <span
              className="
                orbit-document
                orbit-document-right
              "
            >

              <FileText size={25} />

            </span>


            <div className="dashboard-card">

              <div
                className="dashboard-glow"
              />


              {/* Header */}

              <div className="dashboard-header">

                <div>

                  <span className="small-label">
                    Your study material
                  </span>

                  <h3>
                    Operating System.pdf
                  </h3>

                </div>


                <div className="file-icon">

                  <FileText size={25} />

                </div>

              </div>


              {/* Analysis */}

              <div className="analysis-status">

                <div className="status-heading">

                  <span>
                    AI Analysis
                  </span>

                  <span>
                    100%
                  </span>

                </div>


                <div className="progress-track">

                  <div
                    className="progress-value"
                  />

                </div>


                <p>

                  Document processed
                  successfully. Choose your
                  preparation mode.

                </p>

              </div>


              {/* Modes */}

              <div className="mode-grid">

                <div
                  className="
                    mode-card
                    purple
                  "
                >

                  <BookOpen size={23} />

                  <span>
                    MCQs
                  </span>

                  <small>
                    Generate test
                  </small>

                </div>


                <div
                  className="
                    mode-card
                    yellow
                  "
                >

                  <BookOpen size={23} />

                  <span>
                    Q & A
                  </span>

                  <small>
                    Study questions
                  </small>

                </div>


                <div
                  className="
                    mode-card
                    green
                  "
                >

                  <MessageSquareText
                    size={23}
                  />

                  <span>
                    Interview
                  </span>

                  <small>
                    Prepare questions
                  </small>

                </div>

              </div>


              {/* Floating Status */}

              <div
                className="
                  floating-card
                  floating-card-one
                "
              >

                <Sparkles size={18} />

                AI analysis completed

              </div>


              <div
                className="
                  floating-card
                  floating-card-two
                "
              >

                <CheckCircle2 size={18} />

                10 MCQs generated

              </div>

            </div>

          </div>

        </div>

      </main>


      {/* =================================================
          DOCK
          Hero ke baad hai.
          Page ke saath naturally scroll karega.
      ================================================= */}

      <div className="landing-dock-section">

        <Dock
          items={dockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
          distance={200}
        />

      </div>


      {/* =================================================
          FEATURES — BOUNCE CARDS
      ================================================= */}

      <section
        id="features"
        className="
          section
          features-section
        "
      >

        <div className="container">

          <div className="section-heading">

            <span className="section-label">

              Powerful features

            </span>


            <h2>

              Everything you need for

              <span>
                {" "}smarter preparation
              </span>

            </h2>


            <p>

              PrepMate AI converts your
              learning material into useful
              and personalised preparation
              content.

            </p>

          </div>


          <BounceCards
            onStart={openRegister}
          />

        </div>

      </section>


      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <section
        id="how-it-works"
        className="
          section
          process-section
        "
        ref={processSectionRef}
      >

        <div className="container">

          <div className="section-heading">

            <span className="section-label">

              Simple process

            </span>


            <h2>

              Prepare in just

              <span>
                {" "}three simple steps
              </span>

            </h2>


            <p>

              Add your content, select a
              preparation method and let AI
              handle the rest.

            </p>

          </div>


          <div className="steps-grid">

            {steps.map(
              (step, index) => {

                const Icon =
                  step.icon;


                return (

                  /*
                   * IMPORTANT
                   *
                   * GSAP wrapper animate hoga.
                   *
                   * step-card ka existing
                   * CSS float animation safe rahega.
                   */

                  <div
                    className="step-bounce-wrap"
                    key={step.number}
                    ref={(element) => {
                      stepBounceRefs.current[
                        index
                      ] = element;
                    }}
                  >

                    <article
                      className="step-card"
                    >

                      <span
                        className="step-number"
                      >
                        {step.number}
                      </span>


                      <div
                        className="step-icon"
                      >

                        <Icon size={29} />

                      </div>


                      <h3>
                        {step.title}
                      </h3>


                      <p>
                        {step.description}
                      </p>

                    </article>

                  </div>

                );
              }
            )}

          </div>

        </div>

      </section>


      {/* =================================================
          ABOUT
      ================================================= */}

      <section
        id="about"
        className="
          section
          about-section
        "
      >

        <div
          className="
            container
            about-container
          "
        >

          {/* About Left */}

          <div className="about-content">

            <span className="section-label">

              Built for modern learners

            </span>


            <h2>

              Your personal AI preparation
              partner

            </h2>


            <p>

              PrepMate AI helps students
              transform lengthy learning
              material into focused
              preparation resources without
              manually creating questions.

            </p>


            <ul>

              <li>

                <CheckCircle2 size={19} />

                Questions generated from
                uploaded material

              </li>


              <li>

                <CheckCircle2 size={19} />

                Multiple difficulty levels

              </li>


              <li>

                <CheckCircle2 size={19} />

                Answers with clear explanations

              </li>


              <li>

                <CheckCircle2 size={19} />

                Preparation history and
                performance tracking

              </li>

            </ul>

          </div>


          {/* =============================================
              READY TO STUDY SMARTER
              Bounce wrapper added
          ============================================= */}

          <div
            className="cta-bounce-wrap"
            ref={ctaBounceRef}
          >

            <div className="cta-card">

              <div className="cta-icon">

                <BrainCircuit size={37} />

              </div>


              <h3>

                Ready to study smarter?

              </h3>


              <p>

                Upload your first study
                material and start preparing
                with the power of AI.

              </p>


              <button
                className="primary-button"
                onClick={openRegister}
              >

                Create Free Account

                <ArrowRight size={19} />

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div
          className="
            container
            footer-content
          "
        >

          <div className="footer-brand">

            <div className="logo-icon">

              <BrainCircuit size={22} />

            </div>


            <span>

              PrepMate{" "}

              <strong>
                AI
              </strong>

            </span>

          </div>


          <p>

            © 2026 PrepMate AI.
            Smart preparation starts here.

          </p>

        </div>

      </footer>

    </div>
  );
};


export default LandingPage;