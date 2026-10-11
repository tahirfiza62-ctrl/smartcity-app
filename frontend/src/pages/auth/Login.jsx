
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Mail,
  LockKeyhole,
  Building2,
  UserCog,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email.trim() || !formData.password) {
    toast.error("Email and password are required.");
    return;
  }

  try {
    setLoading(true);

    const response = await axios.post(
      "http://localhost:3000/api/auth/login",
      {
        email: formData.email.trim(),
        password: formData.password,
      }
    );

    if (response.data.success && response.data.token) {
      // Save token using the same keys as CitizenDashboard.jsx
      localStorage.setItem(
        "smartcity_token",
        response.data.token
      );

      localStorage.setItem(
        "smartcity_user",
        JSON.stringify(response.data.user)
      );

      toast.success("Login successful!");

      navigate("/citizen", { replace: true });
    } else {
      toast.error(
        response.data.message || "Unable to login."
      );
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    toast.error(
      error.response?.data?.message ||
        "Unable to login. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="auth-page">
      {/* LEFT SIDE */}

      <div className="auth-left">
        <div className="auth-overlay"></div>

        <div className="auth-brand">
          <div className="brand-logo">
            <ShieldCheck size={34} />
          </div>

          <div>
            <h2>SMART CITY</h2>
            <span>DIGITAL GOVERNANCE PLATFORM</span>
          </div>
        </div>

        <div className="auth-left-content">
          <p className="auth-small-title">
            WELCOME BACK
          </p>

          <h1>
            Building a Smarter
            <br />
            <span>City Together.</span>
          </h1>

          <p className="auth-description">
            Access your citizen portal, submit requests,
            track services and stay connected with your
            city's digital services.
          </p>

          <div className="auth-feature">
            <div className="feature-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>Secure &amp; Reliable</strong>

              <p>
                Your information is protected with
                secure authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="auth-left-footer">
          <span>© 2026 Smart City Platform</span>
          <span>Digital Governance</span>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="auth-right">
        <div className="auth-form-container">
          {/* MOBILE BRAND */}

          <div className="mobile-brand">
            <div className="brand-logo">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h2>SMART CITY</h2>
              <span>DIGITAL GOVERNANCE</span>
            </div>
          </div>

          {/* HEADING */}

          <div className="auth-heading">
            <p>WELCOME BACK</p>

            <h1>Sign In</h1>

            <span>
              Sign in to access your citizen account.
            </span>
          </div>

          {/* LOGIN FORM */}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            {/* EMAIL */}

            <div className="input-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    toast(
                      "Password reset will be available soon."
                    )
                  }
                >
                  Forgot Password?
                </button>
              </div>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
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

            {/* REMEMBER */}

            <div className="remember-row">
              <label className="remember-label">
                <input type="checkbox" />

                <span>Remember me</span>
              </label>
            </div>

            {/* SIGN IN */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* SIGN UP */}

          <div className="auth-switch">
            <span>Don't have an account?</span>

            <Link to="/register">
              Create Account
            </Link>
          </div>

          {/* DEPARTMENT LOGIN */}

          <div className="department-login-box">
            <div className="department-login-icon">
              <Building2 size={20} />
            </div>

            <div className="department-login-text">
              <span>
                Are you a department officer?
              </span>

              <Link to="/department-login">
                Department Login
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* ADMIN LOGIN */}

          <div className="admin-login-box">
            <div className="admin-login-icon">
              <UserCog size={20} />
            </div>

            <div className="admin-login-text">
              <span>
                Are you a system administrator?
              </span>

              <Link to="/admin/login">
                Admin Login
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* SECURITY NOTE */}

          <div className="security-note">
            <ShieldCheck size={17} />

            <span>
              Protected by secure authentication
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;