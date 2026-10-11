import  { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Mail,
  LockKeyhole,
  User,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
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

    const {
      fullName,
      email,
      password,
      confirmPassword,
    } = formData;

    // Frontend validation
    if (!fullName.trim() || !email.trim() || !password) {
      toast.error(
        "Full name, email and password are required."
      );
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        }
      );

      if (response.data.success) {
        // Save authentication data
        localStorage.setItem(
          "smartcity_token",
          response.data.token
        );

        localStorage.setItem(
          "smartcity_user",
          JSON.stringify(response.data.user)
        );

        toast.success("Account created successfully!");

        // Go to citizen dashboard
        navigate("/citizen");
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ================= LEFT SIDE ================= */}
      <div className="auth-left">
        <div className="auth-overlay"></div>

        {/* Brand */}
        <div className="auth-brand">
          <div className="brand-logo">
            <ShieldCheck size={34} />
          </div>

          <div>
            <h2>SMART CITY</h2>
            <span>DIGITAL GOVERNANCE PLATFORM</span>
          </div>
        </div>

        {/* Content */}
        <div className="auth-left-content">
          <p className="auth-small-title">
            JOIN THE PLATFORM
          </p>

          <h1>
            Your City.
            <br />
            <span>Your Digital Access.</span>
          </h1>

          <p className="auth-description">
            Create your citizen account and access
            smart city services through one secure
            digital platform.
          </p>

          <div className="auth-feature">
            <div className="feature-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>One Secure Account</strong>

              <p>
                Access your digital city services
                through one convenient account.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-left-footer">
          <span>© 2026 Smart City Platform</span>
          <span>Digital Governance</span>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="auth-right">
        <div className="auth-form-container">

          {/* Mobile Brand */}
          <div className="mobile-brand">
            <div className="brand-logo">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h2>SMART CITY</h2>
              <span>DIGITAL GOVERNANCE</span>
            </div>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <p>GET STARTED</p>

            <h1>Create Account</h1>

            <span>
              Register to access your citizen portal.
            </span>
          </div>

          {/* Form */}
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}
            <div className="input-group">
              <label htmlFor="fullName">
                Full Name
              </label>

              <div className="input-wrapper">
                <User size={19} />

                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

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
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
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

            {/* CONFIRM PASSWORD */}
            <div className="input-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
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

            {/* SUBMIT */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="auth-switch">
            <span>Already have an account?</span>

            <Link to="/login">
              Sign In
            </Link>
          </div>

          {/* SECURITY */}
          <div className="security-note">
            <ShieldCheck size={17} />

            <span>
              Your account information is securely protected
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;