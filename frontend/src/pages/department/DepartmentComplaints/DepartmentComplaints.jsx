import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  FileText,
  Clock,
  AlertCircle,
  Eye,
  Activity,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./DepartmentComplaints.css";

const API_URL = "http://localhost:3000";

const DepartmentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [department, setDepartment] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // DEPARTMENT PORTAL TOKEN
  // =====================================================

  const token = localStorage.getItem("department_token");

  // =====================================================
  // FETCH DEPARTMENT COMPLAINTS
  // =====================================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/department/complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComplaints(response.data.complaints || []);

      setDepartment(
        response.data.department || ""
      );
    } catch (err) {
      console.error(
        "Department complaints error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =====================================================
  // FILTER COMPLAINTS
  // =====================================================

  const filteredComplaints = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !searchText ||
        complaint.complaintId
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.subject
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.citizenName
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.citizenEmail
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.location
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.category
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        complaint.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    complaints,
    search,
    statusFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalComplaints = complaints.length;

  const submittedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "Submitted"
    ).length;

  const inProgressComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "In Progress"
    ).length;

  const resolvedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "Resolved"
    ).length;

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Submitted":
        return "department-status-submitted";

      case "Under Review":
        return "department-status-review";

      case "In Progress":
        return "department-status-progress";

      case "Resolved":
        return "department-status-resolved";

      case "Rejected":
        return "department-status-rejected";

      default:
        return "";
    }
  };

  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Low":
        return "department-priority-low";

      case "High":
        return "department-priority-high";

      case "Medium":
      default:
        return "department-priority-medium";
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="department-complaints-loading">
        <div className="department-loading-spinner" />

        <p>
          Loading department complaints...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="department-complaints-error">
        <AlertCircle size={40} />

        <h3>
          Unable to load complaints
        </h3>

        <p>{error}</p>

        <button onClick={fetchComplaints}>
          <RefreshCw size={17} />
          Try Again
        </button>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="department-complaints-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="department-complaints-header">

        <div>
          <p className="department-complaints-eyebrow">
            DEPARTMENT PORTAL
          </p>

          <h1>
            Assigned Complaints
          </h1>

          <p>
            Complaints automatically assigned to{" "}
            <strong>
              {department ||
                "your department"}
            </strong>
            .
          </p>
        </div>

        <button
          className="department-refresh-btn"
          onClick={fetchComplaints}
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="department-complaint-stats">

        {/* TOTAL */}

        <div className="department-complaint-stat-card">

          <div className="department-stat-icon">
            <FileText size={21} />
          </div>

          <div>
            <span>
              Total Complaints
            </span>

            <strong>
              {totalComplaints}
            </strong>
          </div>

        </div>

        {/* SUBMITTED */}

        <div className="department-complaint-stat-card">

          <div className="department-stat-icon submitted-stat">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>
              New Complaints
            </span>

            <strong>
              {submittedComplaints}
            </strong>
          </div>

        </div>

        {/* IN PROGRESS */}

        <div className="department-complaint-stat-card">

          <div className="department-stat-icon progress-stat">
            <Activity size={21} />
          </div>

          <div>
            <span>
              In Progress
            </span>

            <strong>
              {inProgressComplaints}
            </strong>
          </div>

        </div>

        {/* RESOLVED */}

        <div className="department-complaint-stat-card">

          <div className="department-stat-icon resolved-stat">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>
              Resolved
            </span>

            <strong>
              {resolvedComplaints}
            </strong>
          </div>

        </div>

      </section>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <section className="department-filter-card">

        <div className="department-search-box">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search complaint ID, subject, citizen or location..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">
            All Statuses
          </option>

          <option value="Submitted">
            Submitted
          </option>

          <option value="Under Review">
            Under Review
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Resolved">
            Resolved
          </option>

          <option value="Rejected">
            Rejected
          </option>
        </select>

      </section>

      {/* =================================================
          RESULT COUNT
      ================================================= */}

      <div className="department-result-count">

        <FileText size={18} />

        <span>
          Showing{" "}
          <strong>
            {filteredComplaints.length}
          </strong>{" "}
          of{" "}
          <strong>
            {complaints.length}
          </strong>{" "}
          complaints
        </span>

      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {filteredComplaints.length === 0 ? (

        <div className="department-empty-state">

          <div className="department-empty-icon">
            <FileText size={34} />
          </div>

          <h3>
            No complaints found
          </h3>

          <p>
            There are no complaints matching
            your current filters.
          </p>

        </div>

      ) : (

        /* =================================================
           TABLE
        ================================================= */

        <div className="department-table-card">

          <div className="department-table-wrapper">

            <table className="department-complaints-table">

              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Citizen</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredComplaints.map(
                  (complaint) => (

                    <tr
                      key={complaint._id}
                    >

                      {/* COMPLAINT */}

                      <td>

                        <div className="department-complaint-id">
                          {complaint.complaintId}
                        </div>

                        <div className="department-complaint-subject">
                          {complaint.subject ||
                            "No subject"}
                        </div>

                      </td>

                      {/* CITIZEN */}

                      <td>

                        <div className="department-citizen-name">
                          {complaint.citizenName ||
                            "Citizen"}
                        </div>

                        <div className="department-citizen-email">
                          {complaint.citizenEmail ||
                            "No email"}
                        </div>

                      </td>

                      {/* CATEGORY */}

                      <td>

                        <span className="department-category">
                          {complaint.category ||
                            "Other"}
                        </span>

                      </td>

                      {/* LOCATION */}

                      <td>

                        <span className="department-location">
                          {complaint.location ||
                            "N/A"}
                        </span>

                      </td>

                      {/* PRIORITY */}

                      <td>

                        <span
                          className={`department-priority ${getPriorityClass(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority ||
                            "Medium"}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`department-status ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          {complaint.status ||
                            "Submitted"}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>

                        <div className="department-date">

                          <Clock size={14} />

                          {formatDate(
                            complaint.createdAt
                          )}

                        </div>

                      </td>

                      {/* ACTION */}

                      <td>

                        <Link
                          to={`/department/complaints/${complaint._id}`}
                          className="department-view-btn"
                        >
                          <Eye size={16} />
                          View / Manage
                        </Link>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
};

export default DepartmentComplaints;