
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShieldCheck,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  LoaderCircle,
  Building2,
} from "lucide-react";
import "./AdminLogin.css";

const API_URL = "http://localhost:3000/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/admin-login`,
        { email, password }
      );

      const data = response.data;
      const adminUser = data?.user;
      const role = String(adminUser?.role || "").toLowerCase();
      const token = data?.token;

      if (
        data?.success !== true ||
        !token ||
        !["admin", "administrator"].includes(role)
      ) {
        throw new Error(
          "The server did not confirm administrator access. Check the admin login API."
        );
      }

      // Use one consistent token key throughout the admin portal.
      localStorage.setItem("smartcity_admin_token", token);
      localStorage.setItem(
        "smartcity_admin_user",
        JSON.stringify(adminUser)
      );

      // Remove stale citizen/shared sessions that older admin code used.
      localStorage.removeItem("smartcity_token");
      localStorage.removeItem("smartcity_user");

      setSuccess("Login successful. Opening admin dashboard...");
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(
        "ADMIN LOGIN ERROR:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        setError("Invalid admin email or password.");
      } else if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "This account is not authorized as an active administrator."
        );
      } else if (err.response?.status === 404) {
        setError("Admin login endpoint not found. Check your backend routes.");
      } else if (!err.response) {
        setError(
          "Cannot connect to the backend. Check that it is running on port 3000."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to log in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-background-shape shape-one" />
      <div className="admin-login-background-shape shape-two" />

      <section className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-logo">
            <Building2 size={29} strokeWidth={1.8} />
          </div>
          <div>
            <h1>SMART CITY</h1>
            <p>Digital Governance System</p>
          </div>
        </div>

        <div className="admin-login-shield">
          <ShieldCheck size={34} strokeWidth={1.7} />
        </div>

        <div className="admin-login-heading">
          <span className="admin-login-eyebrow">
            SECURE ADMINISTRATION
          </span>
          <h2>Admin Login</h2>
          <p>
            Sign in with your authorized administrator credentials
            to manage the Smart City system.
          </p>
        </div>

        {error && (
          <div className="admin-login-message error" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="admin-login-message success" role="status">
            <ShieldCheck size={19} />
            <span>{success}</span>
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label htmlFor="admin-email">Email Address</label>
            <div className="admin-login-input-wrap">
              <Mail size={19} className="admin-login-input-icon" />
              <input
                id="admin-email"
                type="email"
                name="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-login-input-wrap">
              <LockKeyhole
                size={19}
                className="admin-login-input-icon"
              />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={19}
                  className="admin-login-spinner"
                />
                Verifying Credentials...
              </>
            ) : (
              <>
                <ShieldCheck size={19} />
                Login as Administrator
              </>
            )}
          </button>
        </form>

        <div className="admin-login-security">
          <LockKeyhole size={16} />
          <p>Protected access for authorized administrators only.</p>
        </div>

        <div className="admin-login-divider">
          <span />
          <span>OR</span>
          <span />
        </div>

        <Link to="/login" className="admin-back-to-login">
          <ArrowLeft size={17} />
          Back to Citizen Login
        </Link>
      </section>

      <footer className="admin-login-footer">
        <p>
          © {new Date().getFullYear()} Smart City Digital Governance System
        </p>
      </footer>
    </main>
  );
};

export default AdminLogin;