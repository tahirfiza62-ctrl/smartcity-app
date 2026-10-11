
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Building2,
  ClipboardList,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  Activity,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

import "./AdminDashboard.css";

const API_URL = "http://localhost:3000/api/admin/dashboard";

const EMPTY_STATS = {
  citizens: 0,
  officers: 0,
  departments: 0,
  complaints: 0,
  resolved: 0,
  pending: 0,
  emergencies: 0,
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH DASHBOARD DATA
  ===================================================== */

  const fetchDashboard = useCallback(async (signal) => {
    setError("");

    try {
      const token = localStorage.getItem("smartcity_admin_token");

      if (!token) {
        throw new Error(
          "Admin session not found. Please log in again."
        );
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            result.message ||
              "Admin access denied. Please log in again with an active administrator account."
          );
        }

        throw new Error(
          result.message ||
            `Unable to load dashboard data (HTTP ${response.status}).`
        );
      }

      if (result.success === false) {
        throw new Error(
          result.message || "Dashboard request failed."
        );
      }

      setStats({
        ...EMPTY_STATS,
        ...(result.stats || {}),
      });

      setComplaints(
        Array.isArray(result.recentComplaints)
          ? result.recentComplaints
          : []
      );
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      console.error("FETCH DASHBOARD ERROR:", err);

      setError(
        err.message || "Unable to load dashboard data."
      );

      setStats(EMPTY_STATS);
      setComplaints([]);
    }
  }, []);

  /* =====================================================
     INITIAL DATA LOAD
  ===================================================== */

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      setLoading(true);

      try {
        await fetchDashboard(controller.signal);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      controller.abort();
    };
  }, [fetchDashboard]);

  /* =====================================================
     REFRESH DASHBOARD
  ===================================================== */

  const handleRefresh = async () => {
    setLoading(true);

    try {
      await fetchDashboard();
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     STATISTICS CARDS
  ===================================================== */

  const statCards = [
    {
      title: "Total Citizens",
      value: stats.citizens,
      icon: Users,
      color: "blue",
      description: "Registered citizen accounts",
    },
    {
      title: "Department Officers",
      value: stats.officers,
      icon: ShieldCheck,
      color: "red",
      description: "Registered department staff",
    },
    {
      title: "Departments",
      value: stats.departments,
      icon: Building2,
      color: "steel",
      description: "Government departments",
    },
    {
      title: "Total Complaints",
      value: stats.complaints,
      icon: ClipboardList,
      color: "blue",
      description: "All submitted complaints",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "green",
      description: "Resolved complaints",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock3,
      color: "orange",
      description: "Awaiting resolution",
    },
    {
      title: "Emergencies",
      value: stats.emergencies,
      icon: AlertTriangle,
      color: "red",
      description: "Reported emergencies",
    },
  ];

  /* =====================================================
     STATUS HELPERS
  ===================================================== */

  const getStatusClass = (status = "") => {
    const normalized = String(status)
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

    if (["resolved", "completed"].includes(normalized)) {
      return "resolved";
    }

    if (["inprogress", "assigned"].includes(normalized)) {
      return "in-progress";
    }

    if (["rejected", "cancelled"].includes(normalized)) {
      return "rejected";
    }

    return "pending";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDepartmentName = (complaint) => {
    if (typeof complaint.department === "string") {
      return complaint.department || "Unassigned";
    }

    return (
      complaint.department?.name ||
      complaint.departmentName ||
      complaint.assignedDepartment?.name ||
      "Unassigned"
    );
  };

  const displayValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number.toLocaleString()
      : "0";
  };

  /* =====================================================
     RENDER DASHBOARD
  ===================================================== */

  return (
    <main className="admin-dashboard">
      {/* PAGE HEADER */}

      <header className="admin-page-header">
        <div className="admin-header-copy">
          <div className="admin-eyebrow">
            <ShieldCheck size={16} />
            SYSTEM ADMINISTRATION
          </div>

          <h1>Admin Dashboard</h1>

          <p>
            Monitor citizens, departments, complaints, and city operations.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "admin-spin" : ""}
          />

          {loading ? "Loading..." : "Refresh Data"}
        </button>
      </header>

      {/* API ERROR */}

      {error && (
        <section className="admin-api-notice" role="alert">
          <AlertTriangle size={21} />

          <div className="admin-api-notice-content">
            <strong>Dashboard data unavailable</strong>

            <p>{error}</p>

            <span>
              Check the admin token and backend dashboard route.
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
          >
            Retry
          </button>
        </section>
      )}

      {/* WELCOME BANNER */}

      <section className="admin-welcome">
        <div className="admin-welcome-content">
          <span className="admin-welcome-label">
            SMART CITY DIGITAL GOVERNANCE
          </span>

          <h2>Welcome to Administration</h2>

          <p>
            Manage public services, monitor complaint resolution, and oversee
            city departments from one central dashboard.
          </p>

          <div className="admin-welcome-meta">
            <span>
              <Activity size={16} />
              Central Management
            </span>

            <span>
              <ShieldCheck size={16} />
              Administrative Access
            </span>
          </div>
        </div>

        <div className="admin-welcome-icon">
          <Building2 size={68} strokeWidth={1.25} />
        </div>

        <div className="admin-welcome-decoration" />
      </section>

      {/* STATISTICS */}

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-section-eyebrow">
              OVERVIEW
            </span>

            <h2>System Statistics</h2>

            <p>
              A summary of your city's digital services.
            </p>
          </div>

          <span
            className={`admin-live-label ${
              error ? "is-error" : ""
            }`}
          >
            <span className="admin-live-dot" />

            {loading
              ? "Updating"
              : error
              ? "Unavailable"
              : "Connected"}
          </span>
        </div>

        <div className="admin-stats-grid">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                className="admin-stat-card"
                key={card.title}
              >
                <div className="admin-stat-top">
                  <div
                    className={`admin-stat-icon ${card.color}`}
                  >
                    <Icon size={22} />
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="admin-stat-arrow"
                  />
                </div>

                <span className="admin-stat-title">
                  {card.title}
                </span>

                <strong className="admin-stat-value">
                  {loading
                    ? "—"
                    : displayValue(card.value)}
                </strong>

                <p>{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* DASHBOARD COLUMNS */}

      <div className="admin-dashboard-columns">
        {/* RECENT COMPLAINTS */}

        <section className="admin-content-card">
          <div className="admin-card-heading">
            <div className="admin-card-heading-icon">
              <ClipboardList size={20} />
            </div>

            <div>
              <h2>Recent Complaints</h2>
              <p>Latest submissions from citizens</p>
            </div>

            <span className="admin-card-count">
              {loading ? "—" : complaints.length}
            </span>
          </div>

          {loading ? (
            <div className="admin-empty-state">
              <RefreshCw
                size={25}
                className="admin-spin"
              />

              <strong>Loading complaints</strong>

              <p>Fetching the latest records.</p>
            </div>
          ) : complaints.length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="admin-complaints-table">
                <thead>
                  <tr>
                    <th>Complaint</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint, index) => (
                    <tr
                      key={
                        complaint._id ||
                        complaint.id ||
                        index
                      }
                    >
                      <td>
                        <strong>
                          {complaint.title ||
                            complaint.subject ||
                            complaint.description ||
                            "Untitled complaint"}
                        </strong>

                        <span>
                          {formatDate(complaint.createdAt)}
                        </span>
                      </td>

                      <td>
                        {getDepartmentName(complaint)}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          {complaint.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <ClipboardList size={34} />

              <strong>
                {error
                  ? "Complaints could not be loaded"
                  : "No recent complaints"}
              </strong>

              <p>
                {error
                  ? "Resolve the API error to see complaint records."
                  : "New complaints will appear here when submitted."}
              </p>
            </div>
          )}
        </section>

        {/* ADMINISTRATION OVERVIEW */}

        <section className="admin-content-card">
          <div className="admin-card-heading">
            <div className="admin-card-heading-icon red">
              <Activity size={20} />
            </div>

            <div>
              <h2>Administration Overview</h2>
              <p>Key system indicators</p>
            </div>
          </div>

          <div className="admin-indicator-list">
            <div className="admin-indicator">
              <div className="admin-indicator-icon blue">
                <Users size={19} />
              </div>

              <div className="admin-indicator-content">
                <strong>Citizen Accounts</strong>
                <span>Registered users</span>
              </div>

              <b>
                {loading
                  ? "—"
                  : displayValue(stats.citizens)}
              </b>
            </div>

            <div className="admin-indicator">
              <div className="admin-indicator-icon green">
                <CheckCircle2 size={19} />
              </div>

              <div className="admin-indicator-content">
                <strong>Resolved Complaints</strong>
                <span>Completed cases</span>
              </div>

              <b>
                {loading
                  ? "—"
                  : displayValue(stats.resolved)}
              </b>
            </div>

            <div className="admin-indicator">
              <div className="admin-indicator-icon orange">
                <Clock3 size={19} />
              </div>

              <div className="admin-indicator-content">
                <strong>Pending Complaints</strong>
                <span>Require attention</span>
              </div>

              <b>
                {loading
                  ? "—"
                  : displayValue(stats.pending)}
              </b>
            </div>

            <div className="admin-indicator">
              <div className="admin-indicator-icon red">
                <MapPin size={19} />
              </div>

              <div className="admin-indicator-content">
                <strong>City Operations</strong>
                <span>GIS and civic assets</span>
              </div>

              <b>
                <CalendarDays size={18} />
              </b>
            </div>
          </div>

          {/* SECURITY NOTE */}

          <div className="admin-security-note">
            <ShieldCheck size={21} />

            <div>
              <strong>Secure Administration</strong>

              <p>
                Administrative operations are protected by server-side
                authentication and role checks.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}

      <footer className="admin-dashboard-footer">
        <span>
          Smart City Digital Governance System
        </span>

        <span>Administration Dashboard</span>
      </footer>
    </main>
  );
};

export default AdminDashboard;

