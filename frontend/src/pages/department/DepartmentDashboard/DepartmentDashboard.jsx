import { useEffect, useState } from "react";
import axios from "axios";

import {
  FileText,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./DepartmentDashboard.css";

const API_URL = "http://localhost:3000";

const DepartmentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     FETCH DASHBOARD
  ========================================================= */

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("department_token");

      console.log(
        "Department token:",
        token ? "FOUND" : "NOT FOUND"
      );

      if (!token) {
        setError(
          "Authentication required. Please login again."
        );
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/department/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Department dashboard response:",
        response.data
      );

      setDashboard(response.data);
    } catch (err) {
      console.error(
        "Department dashboard error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your department session has expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load department dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="department-dashboard-loading">
        <div className="department-spinner"></div>

        <h3>
          Loading department dashboard...
        </h3>

        <p>
          Please wait.
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="department-dashboard-error">
        <div className="department-error-icon">
          <AlertTriangle size={28} />
        </div>

        <h3>
          Unable to load dashboard
        </h3>

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={fetchDashboard}
        >
          Try Again
        </button>
      </div>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  const stats = dashboard?.stats || {};

  const complaints =
    dashboard?.complaints || [];

  const serviceApplications =
    dashboard?.serviceApplications || [];

  const department =
    dashboard?.department ||
    "Department";

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     FORMAT STATUS
  ========================================================= */

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {
    switch (status) {
      case "Resolved":
      case "Approved":
      case "Completed":
        return "success";

      case "In Progress":
      case "Processing":
      case "Under Review":
        return "info";

      case "Pending":
      case "Submitted":
        return "warning";

      case "Rejected":
      case "Cancelled":
        return "danger";

      default:
        return "neutral";
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="department-dashboard">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="department-hero">

        <div className="department-hero-content">

          <p className="department-eyebrow">
            DEPARTMENT PORTAL
          </p>

          <h1>
            {department}
          </h1>

          <p>
            Manage complaints and service
            applications assigned to your department.
          </p>

        </div>

        <div className="department-hero-icon">
          <FileText size={40} />
        </div>

      </section>

      {/* =====================================================
          COMPLAINT STAT CARDS
      ===================================================== */}

      <section className="department-stats">

        {/* TOTAL COMPLAINTS */}

        <div className="department-stat-card">

          <div className="department-stat-icon purple">
            <FileText size={22} />
          </div>

          <div className="department-stat-content">

            <span>
              Total Complaints
            </span>

            <strong>
              {stats.totalComplaints || 0}
            </strong>

          </div>

        </div>

        {/* PENDING COMPLAINTS */}

        <div className="department-stat-card">

          <div className="department-stat-icon orange">
            <Clock3 size={22} />
          </div>

          <div className="department-stat-content">

            <span>
              Pending
            </span>

            <strong>
              {stats.pendingComplaints || 0}
            </strong>

          </div>

        </div>

        {/* IN PROGRESS COMPLAINTS */}

        <div className="department-stat-card">

          <div className="department-stat-icon blue">
            <LoaderCircle size={22} />
          </div>

          <div className="department-stat-content">

            <span>
              In Progress
            </span>

            <strong>
              {stats.inProgressComplaints || 0}
            </strong>

          </div>

        </div>

        {/* RESOLVED COMPLAINTS */}

        <div className="department-stat-card">

          <div className="department-stat-icon green">
            <CheckCircle2 size={22} />
          </div>

          <div className="department-stat-content">

            <span>
              Resolved
            </span>

            <strong>
              {stats.resolvedComplaints || 0}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          SERVICE APPLICATION STATS
      ===================================================== */}

      <section className="department-stats">

        {/* TOTAL APPLICATIONS */}

        <div className="department-stat-card">

          <div className="department-stat-icon purple">
            <ClipboardList size={22} />
          </div>

          <div className="department-stat-content">

            <span>
              Service Applications
            </span>

            <strong>
              {stats.totalServiceApplications || 0}
            </strong>

          </div>

        </div>

        {/* PENDING APPLICATIONS */}

        <div className="department-stat-card">

          <div className="department-stat-icon orange">
            <Clock3 size={22} />
          </div>

          <div className="department-stat-content">

            <span>
              Pending Applications
            </span>

            <strong>
              {stats.pendingServiceApplications || 0}
            </strong>

          </div>

        </div>

        {/* PROCESSING APPLICATIONS */}

        <div className="department-stat-card">

          <div className="department-stat-icon blue">
            <LoaderCircle size={22} />
          </div>

          <div className="department-stat-content">

            <span>
              Processing
            </span>

            <strong>
              {stats.processingServiceApplications || 0}
            </strong>

          </div>

        </div>

        {/* APPROVED APPLICATIONS */}

        <div className="department-stat-card">

          <div className="department-stat-icon green">
            <CheckCircle2 size={22} />
          </div>

          <div className="department-stat-content">

            <span>
              Approved
            </span>

            <strong>
              {stats.approvedServiceApplications || 0}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          RECENT COMPLAINTS
      ===================================================== */}

      <section className="department-panel">

        <div className="department-panel-header">

          <div>

            <p>
              WORK QUEUE
            </p>

            <h2>
              Recent Complaints
            </h2>

          </div>

          <Link
            to="/department/complaints"
            className="department-view-all"
          >
            View All
            <ArrowRight size={15} />
          </Link>

        </div>

        {/* NO COMPLAINTS */}

        {complaints.length === 0 ? (

          <div className="department-empty">

            <FileText size={30} />

            <h3>
              No complaints assigned
            </h3>

            <p>
              New complaints assigned to
              your department will appear here.
            </p>

          </div>

        ) : (

          <div className="department-complaints">

            {complaints
              .slice(0, 8)
              .map((complaint) => (

                <Link
                  key={complaint._id}
                  to={`/department/complaints/${complaint._id}`}
                  className="department-complaint-row"
                >

                  <div className="department-complaint-icon">
                    <FileText size={18} />
                  </div>

                  <div className="department-complaint-info">

                    <strong>
                      {complaint.subject ||
                        "Untitled Complaint"}
                    </strong>

                    <span>
                      {complaint.category}
                      {" • "}
                      {formatDate(
                        complaint.createdAt
                      )}
                    </span>

                  </div>

                  <span
                    className={`department-status ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {formatStatus(
                      complaint.status
                    )}
                  </span>

                </Link>

              ))}

          </div>

        )}

      </section>

      {/* =====================================================
          RECENT SERVICE APPLICATIONS
      ===================================================== */}

      <section className="department-panel">

        <div className="department-panel-header">

          <div>

            <p>
              SERVICE WORK QUEUE
            </p>

            <h2>
              Recent Service Applications
            </h2>

          </div>

          <Link
            to="/department/service-applications"
            className="department-view-all"
          >
            View All
            <ArrowRight size={15} />
          </Link>

        </div>

        {/* NO APPLICATIONS */}

        {serviceApplications.length === 0 ? (

          <div className="department-empty">

            <ClipboardList size={30} />

            <h3>
              No service applications
            </h3>

            <p>
              New service applications assigned
              to your department will appear here.
            </p>

          </div>

        ) : (

          <div className="department-complaints">

            {serviceApplications
              .slice(0, 8)
              .map((application) => (

                <Link
                  key={application._id}
                  to={`/department/service-applications`}
                  className="department-complaint-row"
                >

                  <div className="department-complaint-icon">
                    <ClipboardList size={18} />
                  </div>

                  <div className="department-complaint-info">

                    <strong>
                      {application.serviceName ||
                        application.title ||
                        "Service Application"}
                    </strong>

                    <span>
                      {application.requestId ||
                        "No Request ID"}
                      {" • "}
                      {formatDate(
                        application.createdAt
                      )}
                    </span>

                  </div>

                  <span
                    className={`department-status ${getStatusClass(
                      application.status
                    )}`}
                  >
                    {formatStatus(
                      application.status
                    )}
                  </span>

                </Link>

              ))}

          </div>

        )}

      </section>

    </div>
  );
};

export default DepartmentDashboard;