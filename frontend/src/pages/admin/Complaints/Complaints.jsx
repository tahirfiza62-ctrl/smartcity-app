
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import "./Complaints.css";

const API_URL = "http://localhost:3000/api";

const STATUSES = [
  "Submitted",
  "Pending",
  "Under Review",
  "In Progress",
  "Resolved",
  "Rejected",
  "Closed",
];

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString();
}

function getStatusClass(status) {
  return String(status || "Submitted")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getComplaintId(complaint) {
  return complaint._id || complaint.id;
}

/* =========================================================
   COMPLAINTS COMPONENT
========================================================= */

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  /* =======================================================
     FETCH COMPLAINTS
  ======================================================= */

  const fetchComplaints = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setNotice("");

    try {
      const token = localStorage.getItem("smartcity_admin_token");

      if (!token) {
        throw new Error(
          "Admin token not found. Please log in to your admin account again."
        );
      }

      const response = await fetch(
        `${API_URL}/complaints/admin/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to load complaints (${response.status}).`
        );
      }

      if (!Array.isArray(data.complaints)) {
        throw new Error(
          "The server response does not contain a complaints array."
        );
      }

      setComplaints(data.complaints);
    } catch (err) {
      console.error("FETCH COMPLAINTS ERROR:", err);

      setError(
        err.message || "Unable to load complaints."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     INITIAL FETCH

     Starts the request directly in the effect.
     AbortController prevents updates after unmounting.
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const loadComplaints = async () => {
      try {
        const token = localStorage.getItem("smartcity_admin_token");

        if (!token) {
          setError(
            "Admin token not found. Please log in to your admin account again."
          );
          return;
        }

        const response = await fetch(
          `${API_URL}/complaints/admin/all`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              `Unable to load complaints (${response.status}).`
          );
        }

        if (!Array.isArray(data.complaints)) {
          throw new Error(
            "The server response does not contain a complaints array."
          );
        }

        setComplaints(data.complaints);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("INITIAL COMPLAINT FETCH ERROR:", err);

          setError(
            err.message || "Unable to load complaints."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      controller.abort();
    };
  }, []);

  /* =======================================================
     SEARCH AND STATUS FILTER
  ======================================================= */

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesStatus =
        statusFilter === "All" ||
        complaint.status === statusFilter;

      const searchableText = [
        complaint.complaintId,
        complaint.citizenName,
        complaint.citizenEmail,
        complaint.category,
        complaint.department,
        complaint.subject,
        complaint.description,
        complaint.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(query)
      );
    });
  }, [complaints, search, statusFilter]);

  /* =======================================================
     DASHBOARD COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    return {
      total: complaints.length,

      submitted: complaints.filter(
        (item) => item.status === "Submitted"
      ).length,

      progress: complaints.filter(
        (item) =>
          item.status === "Pending" ||
          item.status === "Under Review" ||
          item.status === "In Progress"
      ).length,

      resolved: complaints.filter(
        (item) => item.status === "Resolved"
      ).length,
    };
  }, [complaints]);

  /* =======================================================
     UPDATE COMPLAINT STATUS
  ======================================================= */

  const updateStatus = async (complaint, newStatus) => {
    const complaintId = getComplaintId(complaint);

    if (!complaintId || !newStatus) return;

    if (newStatus === complaint.status) return;

    try {
      setUpdatingId(complaintId);
      setError("");
      setNotice("");

      const token = localStorage.getItem("smartcity_admin_token");

      if (!token) {
        throw new Error(
          "Admin token not found. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/complaints/${encodeURIComponent(
          complaintId
        )}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update complaint status."
        );
      }

      setComplaints((previous) =>
        previous.map((item) =>
          getComplaintId(item) === complaintId
            ? {
                ...item,
                ...(data.complaint || {}),
                status: newStatus,
              }
            : item
        )
      );

      setNotice(
        `Complaint ${
          complaint.complaintId || complaintId
        } updated to ${newStatus}.`
      );
    } catch (err) {
      console.error(
        "UPDATE COMPLAINT STATUS ERROR:",
        err
      );

      setError(
        err.message || "Failed to update complaint status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="admin-complaints-page">
      {/* PAGE HEADER */}

      <section className="complaints-heading">
        <div>
          <span className="complaints-eyebrow">
            DIGITAL GOVERNANCE / ADMINISTRATION
          </span>

          <h1>Complaints Management</h1>

          <p>
            View citizen complaints, monitor progress, and update
            resolution status.
          </p>
        </div>

        <button
          type="button"
          className="complaints-refresh-btn"
          onClick={() => fetchComplaints(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "refresh-spinning" : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      {/* ERROR MESSAGE */}

      {error && (
        <div
          className="complaints-alert complaints-alert-error"
          role="alert"
        >
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {notice && (
        <div
          className="complaints-alert complaints-alert-success"
          role="status"
        >
          <CheckCircle2 size={19} />
          <span>{notice}</span>
        </div>
      )}

      {/* STATISTICS */}

      <section className="complaints-stat-grid">
        <article className="complaints-stat-card">
          <div className="complaints-stat-icon stat-blue">
            <FileText size={21} />
          </div>

          <div>
            <p>Total Complaints</p>
            <h2>{counts.total}</h2>
          </div>
        </article>

        <article className="complaints-stat-card">
          <div className="complaints-stat-icon stat-red">
            <ShieldAlert size={21} />
          </div>

          <div>
            <p>Submitted</p>
            <h2>{counts.submitted}</h2>
          </div>
        </article>

        <article className="complaints-stat-card">
          <div className="complaints-stat-icon stat-orange">
            <Clock size={21} />
          </div>

          <div>
            <p>In Progress</p>
            <h2>{counts.progress}</h2>
          </div>
        </article>

        <article className="complaints-stat-card">
          <div className="complaints-stat-icon stat-green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <p>Resolved</p>
            <h2>{counts.resolved}</h2>
          </div>
        </article>
      </section>

      {/* COMPLAINTS TABLE */}

      <section className="complaints-table-card">
        <div className="complaints-table-heading">
          <div>
            <h2>All Citizen Complaints</h2>

            <p>
              {loading
                ? "Loading complaints..."
                : `${filteredComplaints.length} complaint(s) displayed`}
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTER */}

        <div className="complaints-toolbar">
          <label className="complaints-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search ID, citizen, category..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </label>

          <select
            className="complaints-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter complaints by status"
          >
            <option value="All">All statuses</option>

            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="complaints-state">
            <RefreshCw
              size={25}
              className="refresh-spinning"
            />

            <p>Loading complaints from the server...</p>
          </div>
        ) : error && complaints.length === 0 ? (
          /* ERROR STATE */

          <div className="complaints-state">
            <AlertCircle size={32} />

            <h3>Could not load complaints</h3>

            <p>
              Check the error message above and verify the
              backend connection.
            </p>

            <button
              type="button"
              className="complaints-retry-btn"
              onClick={() => fetchComplaints()}
            >
              Try Again
            </button>
          </div>
        ) : filteredComplaints.length === 0 ? (
          /* EMPTY STATE */

          <div className="complaints-state">
            <XCircle size={32} />

            <h3>
              {complaints.length === 0
                ? "No complaints found"
                : "No matching complaints"}
            </h3>

            <p>
              {complaints.length === 0
                ? "No complaints were returned by the server. Check whether citizen submissions are being saved to MongoDB."
                : "Try changing your search text or status filter."}
            </p>
          </div>
        ) : (
          /* TABLE */

          <div className="complaints-table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Citizen</th>
                  <th>Category / Department</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map(
                  (complaint, index) => {
                    const id = getComplaintId(complaint);

                    return (
                      <tr
                        key={
                          id ||
                          complaint.complaintId ||
                          index
                        }
                      >
                        <td>
                          <div className="complaint-id">
                            {complaint.complaintId ||
                              "ID unavailable"}
                          </div>

                          <div className="complaint-subject">
                            {complaint.subject || "No subject"}
                          </div>

                          {complaint.priority && (
                            <span
                              className={`complaint-priority priority-${String(
                                complaint.priority
                              ).toLowerCase()}`}
                            >
                              {complaint.priority} priority
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="complaint-citizen-name">
                            {complaint.citizenName ||
                              "Unknown citizen"}
                          </div>

                          <div className="complaint-citizen-email">
                            {complaint.citizenEmail ||
                              "No email"}
                          </div>
                        </td>

                        <td>
                          <div className="complaint-category">
                            {complaint.category ||
                              "Uncategorized"}
                          </div>

                          <div className="complaint-department">
                            {complaint.department ||
                              "Unassigned"}
                          </div>
                        </td>

                        <td>
                          <div className="complaint-location">
                            {complaint.location ||
                              "Not provided"}
                          </div>
                        </td>

                        <td>
                          <span className="complaint-date">
                            {formatDate(complaint.createdAt)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`complaint-status status-${getStatusClass(
                              complaint.status
                            )}`}
                          >
                            {complaint.status || "Submitted"}
                          </span>
                        </td>

                        <td>
                          <select
                            className="complaint-update-select"
                            value={
                              complaint.status || "Submitted"
                            }
                            disabled={updatingId === id}
                            aria-label={`Update status for ${
                              complaint.complaintId ||
                              "complaint"
                            }`}
                            onChange={(event) =>
                              updateStatus(
                                complaint,
                                event.target.value
                              )
                            }
                          >
                            {STATUSES.map((status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            ))}
                          </select>

                          {updatingId === id && (
                            <span className="complaint-saving">
                              Saving...
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}