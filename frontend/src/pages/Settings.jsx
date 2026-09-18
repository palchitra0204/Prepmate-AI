import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  FileQuestion,
  GraduationCap,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  Save,
  SlidersHorizontal,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  VscArchive,
  VscCommentDiscussion,
  VscHistory,
  VscHome,
  VscSettingsGear,
} from "react-icons/vsc";

import Dock from "../components/Dock";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useTheme,
} from "../context/ThemeContext";

import api from "../services/api";

import "../styles/settings.css";


const Settings = () => {
  const navigate =
    useNavigate();

  const {
    user,
    updateUser,
  } = useAuth();

  const {
    theme,
    changeTheme,
  } = useTheme();


  const [
    profileData,
    setProfileData,
  ] = useState({
    name: "",
    email: "",

    defaultMode: "MCQ",

    defaultDifficulty:
      "Medium",

    defaultQuestionCount:
      "10",

    showExplanations:
      true,

    emailNotifications:
      true,

    preparationReminders:
      false,
  });


  const [
    passwordData,
    setPasswordData,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  const [
    showPasswords,
    setShowPasswords,
  ] = useState(false);


  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);


  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);


  const [
    profileError,
    setProfileError,
  ] = useState("");


  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState("");


  const [
    passwordError,
    setPasswordError,
  ] = useState("");


  const [
    passwordSuccess,
    setPasswordSuccess,
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
        navigate("/dashboard"),
    },

    {
      icon:
        <VscArchive size={20} />,

      label:
        "Materials",

      onClick: () =>
        navigate("/materials"),
    },

    {
      icon:
        <VscHistory size={20} />,

      label:
        "History",

      onClick: () =>
        navigate("/history"),
    },

    {
      icon:
        <VscCommentDiscussion
          size={20}
        />,

      label:
        "Chat",

      onClick: () =>
        navigate("/dashboard"),
    },

    {
      icon:
        <VscSettingsGear
          size={20}
        />,

      label:
        "Settings",

      onClick: () =>
        navigate("/settings"),
    },
  ];


  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileData({
      name:
        user.name || "",

      email:
        user.email || "",

      defaultMode:
        user.preferences
          ?.defaultMode ||
        "MCQ",

      defaultDifficulty:
        user.preferences
          ?.defaultDifficulty ||
        "Medium",

      defaultQuestionCount:
        String(
          user.preferences
            ?.defaultQuestionCount ||
          10
        ),

      showExplanations:
        user.preferences
          ?.showExplanations ??
        true,

      emailNotifications:
        user.preferences
          ?.emailNotifications ??
        true,

      preparationReminders:
        user.preferences
          ?.preparationReminders ??
        false,
    });

  }, [user]);


  /* =====================================================
     PROFILE CHANGE
  ===================================================== */

  const handleProfileChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setProfileData(
      (
        previousData
      ) => ({
        ...previousData,

        [name]:
          type ===
            "checkbox"
            ? checked
            : value,
      })
    );


    setProfileError("");

    setProfileSuccess("");
  };


  /* =====================================================
     SAVE PREFERENCES
  ===================================================== */

  const handleProfileSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      try {
        setProfileLoading(true);

        setProfileError("");

        setProfileSuccess("");


        const response =
          await api.put(
            "/users/profile",
            {
              name:
                profileData.name
                  .trim(),

              email:
                profileData.email
                  .trim(),

              preferences: {
                defaultMode:
                  profileData.defaultMode,

                defaultDifficulty:
                  profileData.defaultDifficulty,

                defaultQuestionCount:
                  Number(
                    profileData.defaultQuestionCount
                  ),

                showExplanations:
                  profileData.showExplanations,

                emailNotifications:
                  profileData.emailNotifications,

                preparationReminders:
                  profileData.preparationReminders,
              },
            }
          );


        updateUser(
          response.data.user
        );


        setProfileSuccess(
          response.data.message ||
          "Preferences saved successfully"
        );

      } catch (
      requestError
      ) {
        setProfileError(
          requestError.response
            ?.data?.message ||
          "Unable to save preferences"
        );

      } finally {
        setProfileLoading(false);
      }
    };


  /* =====================================================
     PASSWORD CHANGE
  ===================================================== */

  const handlePasswordChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;


    setPasswordData(
      (
        previousData
      ) => ({
        ...previousData,

        [name]:
          value,
      })
    );


    setPasswordError("");

    setPasswordSuccess("");
  };


  const handlePasswordSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        setPasswordError(
          "Please fill all password fields"
        );

        return;
      }


      if (
        passwordData
          .newPassword
          .length < 6
      ) {
        setPasswordError(
          "New password must be at least 6 characters"
        );

        return;
      }


      if (
        passwordData.newPassword !==
        passwordData.confirmPassword
      ) {
        setPasswordError(
          "New password and confirm password do not match"
        );

        return;
      }


      try {
        setPasswordLoading(true);

        setPasswordError("");

        setPasswordSuccess("");


        const response =
          await api.put(
            "/users/change-password",
            passwordData
          );


        setPasswordSuccess(
          response.data.message ||
          "Password changed successfully"
        );


        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

      } catch (
      requestError
      ) {
        setPasswordError(
          requestError.response
            ?.data?.message ||
          "Unable to change password"
        );

      } finally {
        setPasswordLoading(false);
      }
    };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    updateUser(null);

    navigate("/login", {
      replace: true,
    });
  };


  return (
    <div className="settings-page">

      {/* =================================================
          BACKGROUND ART
      ================================================= */}

      <div
        className="settings-background-art"
        aria-hidden="true"
      >

        <span
          className="
            settings-orbit
            settings-orbit-one
          "
        />

        <span
          className="
            settings-orbit
            settings-orbit-two
          "
        />


        <span
          className="
            settings-floating-icon
            settings-floating-sliders
          "
        >
          <SlidersHorizontal
            size={31}
          />
        </span>


        <span
          className="
            settings-floating-icon
            settings-floating-book
          "
        >
          <BookOpen
            size={31}
          />
        </span>


        <span
          className="
            settings-floating-icon
            settings-floating-brain
          "
        >
          <BrainCircuit
            size={30}
          />
        </span>


        <Sparkles
          className="
            settings-floating-sparkles
            settings-sparkle-one
          "
          size={22}
        />


        <Sparkles
          className="
            settings-floating-sparkles
            settings-sparkle-two
          "
          size={18}
        />

      </div>


      <main className="settings-content">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="settings-header">

          <p>
            Settings
          </p>


          <h1>
            Student{" "}

            <span>
              Preferences
            </span>
          </h1>


          <div className="settings-header-subtitle">
            Set up your ideal
            learning environment.
          </div>

        </header>


        {/* =================================================
            MAIN PREFERENCES CARD
        ================================================= */}

        <form
          className="settings-preferences-card"
          onSubmit={
            handleProfileSubmit
          }
        >

          {profileError && (

            <div
              className="
                settings-message
                settings-error
              "
            >
              {profileError}
            </div>

          )}


          {profileSuccess && (

            <div
              className="
                settings-message
                settings-success
              "
            >

              <CheckCircle2
                size={18}
              />

              {profileSuccess}

            </div>

          )}


          {/* =================================================
              THEME
          ================================================= */}

          <div className="settings-preference-row">

            <div className="settings-row-icon">

              <Sun size={25} />

            </div>


            <div className="settings-row-content">

              <strong>
                Theme
              </strong>

              <span>
                Choose your preferred
                theme.
              </span>

            </div>


            <div className="settings-theme-switcher">

              <button
                type="button"

                className={
                  theme === "light"
                    ? "settings-theme-active"
                    : ""
                }

                onClick={() =>
                  changeTheme(
                    "light"
                  )
                }
              >

                <Sun size={15} />

                Light

              </button>


              <button
                type="button"

                className={
                  theme === "dark"
                    ? "settings-theme-active"
                    : ""
                }

                onClick={() =>
                  changeTheme(
                    "dark"
                  )
                }
              >

                <Moon size={15} />

                Dark

              </button>

            </div>

          </div>


          {/* =================================================
              DEFAULT MODE
          ================================================= */}

          {/* <div className="settings-preference-row">

            <div className="settings-row-icon">

              <BookOpen
                size={25}
              />

            </div>


            <div className="settings-row-content">

              <strong>
                Default Preparation Mode
              </strong>

              <span>
                This will be pre-selected
                for new sessions.
              </span>

            </div>


            <select
              name="defaultMode"

              value={
                profileData.defaultMode
              }

              onChange={
                handleProfileChange
              }
            >

              <option value="MCQ">
                MCQ Practice
              </option>

              <option value="QUESTION_ANSWER">
                Question & Answer
              </option>

              <option value="INTERVIEW">
                Interview Preparation
              </option>

            </select>

          </div> */}


          {/* =================================================
              DIFFICULTY
          ================================================= */}

          {/* <div className="settings-preference-row">

            <div className="settings-row-icon">

              <GraduationCap
                size={25}
              />

            </div>


            <div className="settings-row-content">

              <strong>
                Default Difficulty
              </strong>

              <span>
                Set your preferred
                difficulty level.
              </span>

            </div>


            <select
              name="defaultDifficulty"

              value={
                profileData.defaultDifficulty
              }

              onChange={
                handleProfileChange
              }
            >

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>

            </select>

          </div> */}


          {/* =================================================
              QUESTION COUNT
          ================================================= */}

          {/* <div className="settings-preference-row">

            <div className="settings-row-icon">

              <FileQuestion
                size={25}
              />

            </div>


            <div className="settings-row-content">

              <strong>
                Questions per Session
              </strong>

              <span>
                Number of questions
                in each session.
              </span>

            </div>


            <select
              name="defaultQuestionCount"

              value={
                profileData.defaultQuestionCount
              }

              onChange={
                handleProfileChange
              }
            >

              <option value="5">
                5
              </option>

              <option value="10">
                10
              </option>

              <option value="15">
                15
              </option>

              <option value="20">
                20
              </option>

            </select>

          </div> */}


          {/* =================================================
              AI EXPLANATIONS
          ================================================= */}

          <label className="settings-preference-row settings-toggle-row">

            <div className="settings-row-icon">

              <BrainCircuit
                size={25}
              />

            </div>


            <div className="settings-row-content">

              <strong>
                AI Explanations
              </strong>

              <span>
                Get detailed explanations
                for answers.
              </span>

            </div>


            <input
              type="checkbox"

              name="showExplanations"

              checked={
                profileData.showExplanations
              }

              onChange={
                handleProfileChange
              }
            />


            <span className="settings-switch" />

          </label>


          {/* =================================================
              EMAIL NOTIFICATIONS
          ================================================= */}

          <label className="settings-preference-row settings-toggle-row">

            <div className="settings-row-icon">

              <Mail size={25} />

            </div>


            <div className="settings-row-content">

              <strong>
                Email Notifications
              </strong>

              <span>
                Receive important
                updates.
              </span>

            </div>


            <input
              type="checkbox"

              name="emailNotifications"

              checked={
                profileData.emailNotifications
              }

              onChange={
                handleProfileChange
              }
            />


            <span className="settings-switch" />

          </label>


          {/* =================================================
              STUDY REMINDERS
          ================================================= */}

          <label className="settings-preference-row settings-toggle-row">

            <div className="settings-row-icon">

              <Bell size={25} />

            </div>


            <div className="settings-row-content">

              <strong>
                Study Reminders
              </strong>

              <span>
                Get reminded to keep
                learning.
              </span>

            </div>


            <input
              type="checkbox"

              name="preparationReminders"

              checked={
                profileData.preparationReminders
              }

              onChange={
                handleProfileChange
              }
            />


            <span className="settings-switch" />

          </label>


          {/* =================================================
              SAVE
          ================================================= */}

          <div className="settings-save-row">

            <button
              type="submit"

              className="settings-save-button"

              disabled={
                profileLoading
              }
            >

              <Save size={17} />


              {profileLoading
                ? "Saving..."
                : "Save Preferences"
              }

            </button>

          </div>

        </form>


        {/* =================================================
            ACCOUNT SECTION
        ================================================= */}

        <section className="settings-account-card">

          <div className="settings-account-heading">

            <div className="settings-account-avatar">
              <UserRound size={25} />
            </div>

            <div>
              <p className="settings-account-label">
                Account
              </p>

              <h2>
                {user?.name || "PrepMate User"}
              </h2>

              <div className="settings-account-email">
                <Mail size={15} />

                <span>
                  {user?.email || "Login email unavailable"}
                </span>
              </div>
            </div>

          </div>

          <button
            type="button"
            className="settings-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </section>


        {/* =================================================
            PASSWORD SECTION
        ================================================= */}

        <form
          className="settings-password-card"

          onSubmit={
            handlePasswordSubmit
          }
        >

          <div className="settings-password-heading">

            <div className="settings-row-icon">

              <LockKeyhole
                size={23}
              />

            </div>


            <div>

              <h2>
                Change Password
              </h2>

              <p>
                Keep your account
                secure.
              </p>

            </div>

          </div>


          {passwordError && (

            <div
              className="
                settings-message
                settings-error
              "
            >
              {passwordError}
            </div>

          )}


          {passwordSuccess && (

            <div
              className="
                settings-message
                settings-success
              "
            >

              <CheckCircle2
                size={18}
              />

              {passwordSuccess}

            </div>

          )}


          <div className="settings-password-fields">

            <input
              id="current-password"
              name="currentPassword"

              type={
                showPasswords
                  ? "text"
                  : "password"
              }

              value={
                passwordData.currentPassword
              }

              onChange={
                handlePasswordChange
              }

              placeholder="Current password"
            />


            <input
              id="new-password"
              name="newPassword"

              type={
                showPasswords
                  ? "text"
                  : "password"
              }

              value={
                passwordData.newPassword
              }

              onChange={
                handlePasswordChange
              }

              placeholder="New password"
            />


            <input
              id="confirm-password"
              name="confirmPassword"

              type={
                showPasswords
                  ? "text"
                  : "password"
              }

              value={
                passwordData.confirmPassword
              }

              onChange={
                handlePasswordChange
              }

              placeholder="Confirm new password"
            />

          </div>


          <button
            type="button"

            className="settings-password-toggle"

            onClick={() =>
              setShowPasswords(
                (
                  previousValue
                ) =>
                  !previousValue
              )
            }
          >

            {showPasswords
              ? (
                <EyeOff
                  size={16}
                />
              )
              : (
                <Eye
                  size={16}
                />
              )
            }


            {showPasswords
              ? "Hide passwords"
              : "Show passwords"
            }

          </button>


          <button
            type="submit"

            className="settings-password-button"

            disabled={
              passwordLoading
            }
          >

            <LockKeyhole
              size={17}
            />


            {passwordLoading
              ? "Changing..."
              : "Change Password"
            }

          </button>

        </form>

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


export default Settings;
