import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Lock,
  Mail,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import "./DepartmentLogin.css";

const API_URL = "http://localhost:3000";

const DepartmentLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/department-login`,
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      /* ============================================
         DEPARTMENT SESSION
      ============================================ */

      localStorage.setItem(
        "department_token",
        token
      );

      localStorage.setItem(
        "department_user",
        JSON.stringify(user)
      );

      navigate("/department");

    } catch (err) {

      console.error(
        "DEPARTMENT LOGIN ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to login. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="department-login-page">

      <div className="department-login-card">

        {/* ICON */}

        <div className="department-login-icon">
          <Building2 size={32} />
        </div>

        {/* HEADING */}

        <div className="department-login-heading">

          <h1>
            CIVIC CONNECT
          </h1>

          <p>
            Department Officer Portal
          </p>

        </div>

        {/* WELCOME */}

        <div className="department-login-welcome">

          <h2>
            Officer Login
          </h2>

          <p>
            Sign in to manage complaints assigned
            to your department.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="department-login-error">
            {error}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="department-form-group">

            <label>
              Email Address
            </label>

            <div className="department-input-wrapper">

              <Mail size={18} />

              <input
                type="email"
                placeholder="officer@civicconnect.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div className="department-form-group">

            <label>
              Password
            </label>

            <div className="department-input-wrapper">

              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >

                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}

              </button>

            </div>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="department-login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        {/* FOOTER */}

        <div className="department-login-footer">

          <span>
            Authorized Department Officers Only
          </span>

        </div>

      </div>

    </div>
  );
};

export default DepartmentLogin;