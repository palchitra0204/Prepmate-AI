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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

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

    const email = formData.email
      .trim()
      .toLowerCase();

    if (!email || !formData.password) {
      setError(
        "Please enter your email and password"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await login(
        email,
        formData.password
      );

      const loggedInUser = response?.user;

      if (loggedInUser?.role === "Admin") {
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
        "Login failed. Please check your details"
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
            <h1>Welcome back</h1>

            <p>
              Login to continue your preparation.
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
              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
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
              <label htmlFor="login-password">
                Password
              </label>

              <div className="auth-password-field">
                <input
                  id="login-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch-text">
            Don&apos;t have an account?{" "}
            <Link to="/register">
              Create account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;