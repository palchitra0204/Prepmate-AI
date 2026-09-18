import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  FileQuestion,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  Mail,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import "../styles/auth.css";


const Register = () => {
  const navigate =
    useNavigate();


  const {
    register,
    verifyRegistrationOtp,
    resendRegistrationOtp,
  } = useAuth();


  const [
    registrationStep,
    setRegistrationStep,
  ] = useState("DETAILS");


  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const [
    verificationEmail,
    setVerificationEmail,
  ] = useState("");


  const [
    otp,
    setOtp,
  ] = useState("");


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    resendLoading,
    setResendLoading,
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
     FORM CHANGE
  ===================================================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;


    setFormData(
      (
        previousData
      ) => ({
        ...previousData,

        [name]:
          value,
      })
    );


    setError("");

    setSuccess("");
  };


  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegisterSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      const name =
        formData.name.trim();


      const email =
        formData.email
          .trim()
          .toLowerCase();


      if (
        !name ||
        !email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError(
          "Please fill in all fields"
        );

        return;
      }


      if (
        formData.password.length <
        6
      ) {
        setError(
          "Password must be at least 6 characters"
        );

        return;
      }


      if (
        formData.password !==
        formData.confirmPassword
      ) {
        setError(
          "Password and confirm password do not match"
        );

        return;
      }


      try {
        setLoading(true);

        setError("");

        setSuccess("");


        const response =
          await register({
            name,

            email,

            password:
              formData.password,

            confirmPassword:
              formData.confirmPassword,
          });


        setVerificationEmail(
          response.email || email
        );


        setRegistrationStep(
          "VERIFY_OTP"
        );


        setSuccess(
          response.message ||
          "Verification code sent to your email"
        );

      } catch (
      requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
          "Registration failed. Please try again"
        );

      } finally {
        setLoading(false);
      }
    };


  /* =====================================================
     OTP CHANGE
  ===================================================== */

  const handleOtpChange = (
    event
  ) => {
    const numericValue =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);


    setOtp(
      numericValue
    );


    setError("");

    setSuccess("");
  };


  /* =====================================================
     VERIFY OTP
  ===================================================== */

  const handleOtpSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      if (otp.length !== 6) {
        setError(
          "Please enter the complete 6-digit verification code"
        );

        return;
      }


      try {
        setLoading(true);

        setError("");

        setSuccess("");


        const response =
          await verifyRegistrationOtp({
            email:
              verificationEmail,

            otp,
          });


        const registeredUser =
          response.user;


        if (
          registeredUser?.role ===
          "Admin"
        ) {
          navigate(
            "/admin",
            {
              replace:
                true,
            }
          );

        } else {
          navigate(
            "/dashboard",
            {
              replace:
                true,
            }
          );
        }

      } catch (
      requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
          "Unable to verify the code"
        );

      } finally {
        setLoading(false);
      }
    };


  /* =====================================================
     RESEND OTP
  ===================================================== */

  const handleResendOtp =
    async () => {
      try {
        setResendLoading(true);

        setError("");

        setSuccess("");


        const response =
          await resendRegistrationOtp(
            verificationEmail
          );


        setSuccess(
          response.message ||
          "A new verification code has been sent"
        );

      } catch (
      requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
          "Unable to resend verification code"
        );

      } finally {
        setResendLoading(false);
      }
    };


  /* =====================================================
     CHANGE EMAIL
  ===================================================== */

  const handleChangeEmail = () => {
    setRegistrationStep(
      "DETAILS"
    );

    setOtp("");

    setError("");

    setSuccess("");
  };


  return (
    <div className="auth-page">

      {/* =================================================
    FLOATING BACKGROUND
================================================= */}

      <div
        className="auth-floating-background"
        aria-hidden="true"
      >
        <span className="auth-floating-orbit auth-floating-orbit-one" />

        <span className="auth-floating-orbit auth-floating-orbit-two" />

        <span className="auth-floating-orbit auth-floating-orbit-three" />


        <span className="auth-floating-item auth-floating-book">
          <BookOpen size={31} />
        </span>


        <span className="auth-floating-item auth-floating-brain">
          <BrainCircuit size={32} />
        </span>


        <span className="auth-floating-item auth-floating-question">
          <FileQuestion size={29} />
        </span>


        <span className="auth-floating-item auth-floating-cap">
          <GraduationCap size={33} />
        </span>


        <span className="auth-floating-item auth-floating-sparkle-one">
          <Sparkles size={25} />
        </span>


        <span className="auth-floating-item auth-floating-sparkle-two">
          <Sparkles size={20} />
        </span>
      </div>

      <Link
        to="/"
        className="auth-back-link"
      >
        <ArrowLeft size={18} />

        Back to home
      </Link>


      <div className="auth-layout">

        {/* =================================================
            INTRODUCTION
        ================================================= */}

        <section className="auth-introduction">

          <Link
            to="/"
            className="auth-logo"
          >
            <BrainCircuit
              size={35}
            />

            <span>
              PrepMate AI
            </span>
          </Link>


          <div>

            <div className="auth-badge">
              <Sparkles
                size={16}
              />

              AI-powered preparation
            </div>


            <h2>
              Turn your study material
              into smarter preparation.
            </h2>


            <p>
              Upload your notes and
              prepare with MCQs,
              question-answers and
              interview questions.
            </p>

          </div>

        </section>


        {/* =================================================
            REGISTER DETAILS
        ================================================= */}

        {registrationStep ===
          "DETAILS" && (

            <section className="auth-card">

              <div className="auth-card-heading">

                <h1>
                  Create account
                </h1>


                <p>
                  Start your personalised
                  preparation.
                </p>

              </div>


              {error && (

                <div
                  className="
                  auth-message
                  auth-error
                "
                  role="alert"
                >
                  {error}
                </div>

              )}


              <form
                className="auth-form"
                onSubmit={
                  handleRegisterSubmit
                }
              >

                <div className="auth-form-group">

                  <label htmlFor="register-name">
                    Full name
                  </label>


                  <input
                    id="register-name"

                    name="name"

                    type="text"

                    value={
                      formData.name
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Enter your full name"

                    autoComplete="name"

                    disabled={
                      loading
                    }
                  />

                </div>


                <div className="auth-form-group">

                  <label htmlFor="register-email">
                    Email address
                  </label>


                  <input
                    id="register-email"

                    name="email"

                    type="email"

                    value={
                      formData.email
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="you@example.com"

                    autoComplete="email"

                    disabled={
                      loading
                    }
                  />

                </div>


                <div className="auth-form-group">

                  <label htmlFor="register-password">
                    Password
                  </label>


                  <div className="auth-password-field">

                    <input
                      id="register-password"

                      name="password"

                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }

                      value={
                        formData.password
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="Minimum 6 characters"

                      autoComplete="new-password"

                      disabled={
                        loading
                      }
                    />


                    <button
                      type="button"

                      className="auth-password-button"

                      onClick={() =>
                        setShowPassword(
                          (
                            previousValue
                          ) =>
                            !previousValue
                        )
                      }

                      disabled={
                        loading
                      }

                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={19}
                        />
                      ) : (
                        <Eye
                          size={19}
                        />
                      )}
                    </button>

                  </div>

                </div>


                <div className="auth-form-group">

                  <label htmlFor="confirm-password">
                    Confirm password
                  </label>


                  <div className="auth-password-field">

                    <input
                      id="confirm-password"

                      name="confirmPassword"

                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }

                      value={
                        formData
                          .confirmPassword
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="Enter password again"

                      autoComplete="new-password"

                      disabled={
                        loading
                      }
                    />


                    <button
                      type="button"

                      className="auth-password-button"

                      onClick={() =>
                        setShowConfirmPassword(
                          (
                            previousValue
                          ) =>
                            !previousValue
                        )
                      }

                      disabled={
                        loading
                      }

                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={19}
                        />
                      ) : (
                        <Eye
                          size={19}
                        />
                      )}
                    </button>

                  </div>

                </div>


                <button
                  type="submit"

                  className="auth-submit-button"

                  disabled={
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        className="auth-spin"
                        size={20}
                      />

                      Sending code...
                    </>
                  ) : (
                    <>
                      Continue with email

                      <ArrowRight
                        size={20}
                      />
                    </>
                  )}
                </button>

              </form>


              <p className="auth-switch-text">
                Already have an account?{" "}

                <Link to="/login">
                  Login
                </Link>
              </p>

            </section>

          )}


        {/* =================================================
            OTP VERIFICATION
        ================================================= */}

        {registrationStep ===
          "VERIFY_OTP" && (

            <section className="auth-card">

              <div className="auth-card-heading">

                <div className="auth-badge">
                  <Mail size={16} />

                  Email verification
                </div>


                <h1>
                  Check your email
                </h1>


                <p>
                  We sent a 6-digit
                  verification code to{" "}

                  <strong>
                    {verificationEmail}
                  </strong>
                </p>

              </div>


              {error && (

                <div
                  className="
                  auth-message
                  auth-error
                "
                  role="alert"
                >
                  {error}
                </div>

              )}


              {success && (

                <div
                  className="
                  auth-message
                  auth-success
                "
                  role="status"
                >
                  <CheckCircle2
                    size={18}
                  />

                  {success}
                </div>

              )}


              <form
                className="auth-form"
                onSubmit={
                  handleOtpSubmit
                }
              >

                <div className="auth-form-group">

                  <label htmlFor="registration-otp">
                    Verification code
                  </label>


                  <div className="auth-password-field">

                    <input
                      id="registration-otp"

                      name="otp"

                      type="text"

                      inputMode="numeric"

                      value={
                        otp
                      }

                      onChange={
                        handleOtpChange
                      }

                      placeholder="Enter 6-digit code"

                      autoComplete="one-time-code"

                      maxLength={6}

                      disabled={
                        loading
                      }
                    />


                    <span
                      className="auth-password-button"
                      aria-hidden="true"
                    >
                      <KeyRound
                        size={19}
                      />
                    </span>

                  </div>

                </div>


                <button
                  type="submit"

                  className="auth-submit-button"

                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        className="auth-spin"
                        size={20}
                      />

                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify account

                      <ArrowRight
                        size={20}
                      />
                    </>
                  )}
                </button>


                <button
                  type="button"

                  className="auth-submit-button"

                  onClick={
                    handleResendOtp
                  }

                  disabled={
                    resendLoading ||
                    loading
                  }
                >
                  {resendLoading ? (
                    <>
                      <LoaderCircle
                        className="auth-spin"
                        size={19}
                      />

                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw
                        size={18}
                      />

                      Resend verification code
                    </>
                  )}
                </button>

              </form>


              <p className="auth-switch-text">
                Wrong email address?{" "}

                <button
                  type="button"

                  onClick={
                    handleChangeEmail
                  }
                >
                  Change email
                </button>
              </p>

            </section>

          )}

      </div>

    </div>
  );
};


export default Register;