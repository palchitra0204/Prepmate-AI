import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/auth.css";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email
      .trim()
      .toLowerCase();

    if (
      !name ||
      !email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
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

      const response = await register({
        name,
        email,
        password: formData.password,
        confirmPassword:
          formData.confirmPassword,
      });

      const registeredUser =
        response?.user;

      if (
        registeredUser?.role === "Admin"
      ) {
        navigate("/admin", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Registration failed. Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link
        to="/"
        className="auth-back-link"
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>

      <div className="auth-layout">
        <section className="auth-introduction">
          <Link
            to="/"
            className="auth-logo"
          >
            <BrainCircuit size={35} />
            <span>PrepMate AI</span>
          </Link>

          <div>
            <div className="auth-badge">
              <Sparkles size={16} />
              AI-powered preparation
            </div>

            <h2>
              Turn your study material into
              smarter preparation.
            </h2>

            <p>
              Upload your notes and prepare with
              MCQs, question-answers and interview
              questions.
            </p>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-heading">
            <h1>Create account</h1>

            <p>
              Start your personalised preparation.
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
            onSubmit={handleSubmit}
          >
            <div className="auth-form-group">
              <label htmlFor="register-name">
                Full name
              </label>

              <input
                id="register-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={loading}
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
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="auth-password-button"
                  onClick={() =>
                    setShowPassword(
                      (previousValue) =>
                        !previousValue
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
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
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Enter password again"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="auth-password-button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previousValue) =>
                        !previousValue
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle
                    className="auth-spin"
                    size={20}
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={20} />
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
      </div>
    </div>
  );
};

export default Register;