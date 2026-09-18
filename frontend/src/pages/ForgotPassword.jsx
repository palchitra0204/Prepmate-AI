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
  LockKeyhole,
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


const ForgotPassword = () => {
  const navigate =
    useNavigate();


  const {
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword,
  } = useAuth();


  const [
    currentStep,
    setCurrentStep,
  ] = useState("EMAIL");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    otp,
    setOtp,
  ] = useState("");


  const [
    resetToken,
    setResetToken,
  ] = useState("");


  const [
    passwordData,
    setPasswordData,
  ] = useState({
    newPassword: "",
    confirmPassword: "",
  });


  const [
    showNewPassword,
    setShowNewPassword,
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
     SEND RESET OTP
  ===================================================== */

  const handleEmailSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      const normalizedEmail =
        email.trim().toLowerCase();


      if (!normalizedEmail) {
        setError(
          "Please enter your email address"
        );

        return;
      }


      try {
        setLoading(true);

        setError("");

        setSuccess("");


        const response =
          await requestPasswordReset(
            normalizedEmail
          );


        setEmail(
          response.email ||
          normalizedEmail
        );


        setCurrentStep(
          "OTP"
        );


        setSuccess(
          response.message ||
          "Password-reset code sent to your email"
        );

      } catch (
        requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
          "Unable to send password-reset code"
        );

      } finally {
        setLoading(false);
      }
    };


  /* =====================================================
     VERIFY RESET OTP
  ===================================================== */

  const handleOtpSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      if (otp.length !== 6) {
        setError(
          "Please enter the complete 6-digit code"
        );

        return;
      }


      try {
        setLoading(true);

        setError("");

        setSuccess("");


        const response =
          await verifyPasswordResetOtp({
            email,
            otp,
          });


        setResetToken(
          response.resetToken
        );


        setCurrentStep(
          "PASSWORD"
        );


        setSuccess(
          response.message ||
          "Code verified successfully"
        );

      } catch (
        requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
          "Unable to verify password-reset code"
        );

      } finally {
        setLoading(false);
      }
    };


  /* =====================================================
     RESEND RESET OTP
  ===================================================== */

  const handleResendOtp =
    async () => {
      try {
        setResendLoading(true);

        setError("");

        setSuccess("");


        const response =
          await requestPasswordReset(
            email
          );


        setSuccess(
          response.message ||
          "A new password-reset code has been sent"
        );

      } catch (
        requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
          "Unable to resend password-reset code"
        );

      } finally {
        setResendLoading(false);
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


    setError("");

    setSuccess("");
  };


  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const handlePasswordSubmit =
    async (
      event
    ) => {
      event.preventDefault();


      if (
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        setError(
          "Please fill both password fields"
        );

        return;
      }


      if (
        passwordData.newPassword.length <
        6
      ) {
        setError(
          "New password must be at least 6 characters"
        );

        return;
      }


      if (
        passwordData.newPassword !==
        passwordData.confirmPassword
      ) {
        setError(
          "New password and confirm password do not match"
        );

        return;
      }


      try {
        setLoading(true);

        setError("");

        setSuccess("");


        const response =
          await resetPassword({
            email,

            resetToken,

            newPassword:
              passwordData.newPassword,

            confirmPassword:
              passwordData.confirmPassword,
          });


        setCurrentStep(
          "SUCCESS"
        );


        setSuccess(
          response.message ||
          "Password changed successfully"
        );

      } catch (
        requestError
      ) {
        setError(
          requestError.response
            ?.data?.message ||
          "Unable to reset password"
        );

      } finally {
        setLoading(false);
      }
    };


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


  return (
    <div className="auth-page">

      {/* FLOATING BACKGROUND */}

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
      </div>


      <Link
        to="/login"
        className="auth-back-link"
      >
        <ArrowLeft size={18} />

        Back to login
      </Link>


      <div className="auth-layout">

        {/* INTRODUCTION */}

        <section className="auth-introduction">

          <Link
            to="/"
            className="auth-logo"
          >
            <BrainCircuit size={35} />

            <span>
              PrepMate AI
            </span>
          </Link>


          <div>

            <div className="auth-badge">
              <LockKeyhole size={16} />

              Secure account recovery
            </div>


            <h2>
              Recover your account securely.
            </h2>


            <p>
              Verify your email and create a
              new password to continue your
              preparation.
            </p>

          </div>

        </section>


        {/* EMAIL STEP */}

        {currentStep === "EMAIL" && (

          <section className="auth-card">

            <div className="auth-card-heading">

              <h1>
                Forgot password?
              </h1>


              <p>
                Enter your registered email
                address to receive a verification
                code.
              </p>

            </div>


            {error && (
              <div
                className="auth-message auth-error"
                role="alert"
              >
                {error}
              </div>
            )}


            <form
              className="auth-form"
              onSubmit={
                handleEmailSubmit
              }
            >

              <div className="auth-form-group">

                <label htmlFor="reset-email">
                  Email address
                </label>


                <div className="auth-password-field">

                  <input
                    id="reset-email"

                    name="email"

                    type="email"

                    value={
                      email
                    }

                    onChange={(
                      event
                    ) => {
                      setEmail(
                        event.target.value
                      );

                      setError("");
                    }}

                    placeholder="you@example.com"

                    autoComplete="email"

                    disabled={
                      loading
                    }
                  />


                  <span
                    className="auth-password-button"
                    aria-hidden="true"
                  >
                    <Mail size={19} />
                  </span>

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
                    Send verification code

                    <ArrowRight size={20} />
                  </>
                )}
              </button>

            </form>


            <p className="auth-switch-text">
              Remember your password?{" "}

              <Link to="/login">
                Login
              </Link>
            </p>

          </section>

        )}


        {/* OTP STEP */}

        {currentStep === "OTP" && (

          <section className="auth-card">

            <div className="auth-card-heading">

              <div className="auth-badge">
                <KeyRound size={16} />

                Verification
              </div>


              <h1>
                Check your email
              </h1>


              <p>
                Enter the 6-digit code sent to{" "}

                <strong>
                  {email}
                </strong>
              </p>

            </div>


            {error && (
              <div
                className="auth-message auth-error"
                role="alert"
              >
                {error}
              </div>
            )}


            {success && (
              <div
                className="auth-message auth-success"
                role="status"
              >
                <CheckCircle2 size={18} />

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

                <label htmlFor="reset-otp">
                  Verification code
                </label>


                <input
                  id="reset-otp"

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
                    Verify code

                    <ArrowRight size={20} />
                  </>
                )}
              </button>

            </form>


            <p className="auth-switch-text">
              Didn&apos;t receive the code?{" "}

              <button
                type="button"

                onClick={
                  handleResendOtp
                }

                disabled={
                  resendLoading ||
                  loading
                }
              >
                {resendLoading
                  ? "Sending..."
                  : (
                    <>
                      <RefreshCw size={13} />
                      Resend code
                    </>
                  )
                }
              </button>
            </p>

          </section>

        )}


        {/* NEW PASSWORD STEP */}

        {currentStep === "PASSWORD" && (

          <section className="auth-card">

            <div className="auth-card-heading">

              <div className="auth-badge">
                <LockKeyhole size={16} />

                Create new password
              </div>


              <h1>
                Reset password
              </h1>


              <p>
                Create a strong new password
                for your PrepMate account.
              </p>

            </div>


            {error && (
              <div
                className="auth-message auth-error"
                role="alert"
              >
                {error}
              </div>
            )}


            {success && (
              <div
                className="auth-message auth-success"
                role="status"
              >
                <CheckCircle2 size={18} />

                {success}
              </div>
            )}


            <form
              className="auth-form"
              onSubmit={
                handlePasswordSubmit
              }
            >

              <div className="auth-form-group">

                <label htmlFor="new-password">
                  New password
                </label>


                <div className="auth-password-field">

                  <input
                    id="new-password"

                    name="newPassword"

                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }

                    value={
                      passwordData.newPassword
                    }

                    onChange={
                      handlePasswordChange
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
                      setShowNewPassword(
                        (
                          previousValue
                        ) =>
                          !previousValue
                      )
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>


              <div className="auth-form-group">

                <label htmlFor="confirm-new-password">
                  Confirm new password
                </label>


                <div className="auth-password-field">

                  <input
                    id="confirm-new-password"

                    name="confirmPassword"

                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }

                    value={
                      passwordData.confirmPassword
                    }

                    onChange={
                      handlePasswordChange
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
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
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

                    Updating password...
                  </>
                ) : (
                  <>
                    Update password

                    <ArrowRight size={20} />
                  </>
                )}
              </button>

            </form>

          </section>

        )}


        {/* SUCCESS STEP */}

        {currentStep === "SUCCESS" && (

          <section className="auth-card">

            <div className="auth-card-heading">

              <div className="auth-badge">
                <CheckCircle2 size={16} />

                Password updated
              </div>


              <h1>
                Password changed
              </h1>


              <p>
                Your password was updated
                successfully. You can now login
                using your new password.
              </p>

            </div>


            {success && (
              <div
                className="auth-message auth-success"
                role="status"
              >
                <CheckCircle2 size={18} />

                {success}
              </div>
            )}


            <button
              type="button"

              className="auth-submit-button"

              onClick={() =>
                navigate(
                  "/login",
                  {
                    replace: true,
                  }
                )
              }
            >
              Continue to login

              <ArrowRight size={20} />
            </button>

          </section>

        )}

      </div>

    </div>
  );
};


export default ForgotPassword;