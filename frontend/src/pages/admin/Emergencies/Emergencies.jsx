
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import "./Emergencies.css";

const API_URL = "http://localhost:3000/api";

/* =========================================================
   CONFIGURATION
========================================================= */

const STATUS_OPTIONS = [
  "All Statuses",
  "Reported",
  "Assigned",
  "In Progress",
  "Resolved",
  "Cancelled",
];

const PRIORITY_OPTIONS = [
  "All Priorities",
  "Critical",
  "High",
  "Medium",
  "Low",
];

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

const getAdminToken = () =>
  localStorage.getItem("smartcity_admin_token") ||
  localStorage.getItem("adminToken") ||
  localStorage.getItem("admin_token") ||
  localStorage.getItem("token");

const getAuthHeaders = (includeJson = false) => {
  const token = getAdminToken();

  if (!token) {
    throw new Error(
      "Admin authentication token is required. Please log in again."
    );
  }

  return {
    Accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token}`,
  };
};

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

const normalizeStatus = (status = "") => {
  const value = String(status).toLowerCase().replaceAll("_", " ").trim();

  if (["resolved", "closed", "completed"].includes(value)) {
    return "Resolved";
  }

  if (["cancelled", "canceled"].includes(value)) {
    return "Cancelled";
  }

  if (value === "assigned") {
    return "Assigned";
  }

  if (["in progress", "in-progress", "processing"].includes(value)) {
    return "In Progress";
  }

  if (["reported", "pending", "new"].includes(value)) {
    return "Reported";
  }

  return "Reported";
};

const normalizePriority = (priority = "") => {
  const value = String(priority).toLowerCase().trim();

  if (["critical", "urgent", "emergency"].includes(value)) {
    return "Critical";
  }

  if (["high", "severe"].includes(value)) {
    return "High";
  }

  if (["low", "minor"].includes(value)) {
    return "Low";
  }

  return "Medium";
};

const getId = (item) => item?._id || item?.id;

const getTitle = (item) =>
  item?.title ||
  item?.emergencyType ||
  item?.type ||
  item?.category ||
  "Emergency Report";

const getLocation = (item) =>
  item?.location ||
  item?.address ||
  item?.area ||
  item?.ward ||
  "Location not provided";

const getCitizen = (item) =>
  item?.citizenName ||
  item?.name ||
  item?.reportedBy?.name ||
  item?.citizen?.fullName ||
  item?.citizen?.name ||
  "Unknown Citizen";

const getPhone = (item) =>
  item?.phone ||
  item?.contactNumber ||
  item?.reportedBy?.phone ||
  item?.citizen?.phone ||
  "";

const getDescription = (item) =>
  item?.description ||
  item?.details ||
  item?.message ||
  "No description provided.";

const getDate = (item) => {
  const value = item?.reportedAt || item?.createdAt || item?.date;

  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

const Emergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [priorityFilter, setPriorityFilter] =
    useState("All Priorities");
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [updatingId, setUpdatingId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  /* =======================================================
     FETCH EMERGENCIES
     This function returns data and does not directly set state.
  ======================================================= */

  const fetchEmergencies = useCallback(async (signal) => {
    try {
      const response = await fetch(`${API_URL}/admin/emergencies`, {
        method: "GET",
        headers: getAuthHeaders(),
        signal,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            (response.status === 401 || response.status === 403
              ? "Your admin session is invalid or expired. Please log in again."
              : "Unable to load emergency reports.")
        );
      }

      const records = Array.isArray(result)
        ? result
        : result.emergencies || result.data || result.reports || [];

      if (!Array.isArray(records)) {
        throw new Error(
          "The server returned an invalid emergency records list."
        );
      }

      return {
        records,
        error: "",
      };
    } catch (err) {
      if (err.name === "AbortError") {
        return null;
      }

      return {
        records: null,
        error:
          err.message ||
          "Could not connect to the server. Check your backend and API route.",
      };
    }
  }, []);

  /* =======================================================
     LOAD EMERGENCIES
     State updates occur after the asynchronous request.
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const loadEmergencies = async () => {
      const result = await fetchEmergencies(controller.signal);

      if (!result || controller.signal.aborted) {
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setEmergencies(result.records);
        setError("");
      }

      setLoading(false);
      setRefreshing(false);
    };

    loadEmergencies();

    return () => {
      controller.abort();
    };
  }, [fetchEmergencies, refreshKey]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshEmergencies = () => {
    setRefreshing(true);
    setError("");
    setSuccess("");
    setRefreshKey((current) => current + 1);
  };

  /* =======================================================
     DASHBOARD STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const pending = emergencies.filter(
      (item) => normalizeStatus(item.status) === "Reported"
    ).length;

    const inProgress = emergencies.filter((item) =>
      ["Assigned", "In Progress"].includes(
        normalizeStatus(item.status)
      )
    ).length;

    const resolved = emergencies.filter(
      (item) => normalizeStatus(item.status) === "Resolved"
    ).length;

    const critical = emergencies.filter(
      (item) =>
        normalizePriority(item.severity || item.priority) === "Critical" &&
        !["Resolved", "Cancelled"].includes(normalizeStatus(item.status))
    ).length;

    return {
      total: emergencies.length,
      pending,
      inProgress,
      resolved,
      critical,
    };
  }, [emergencies]);

  /* =======================================================
     SEARCH AND FILTER
  ======================================================= */

  const filteredEmergencies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return emergencies.filter((item) => {
      const searchableText = [
        getTitle(item),
        getLocation(item),
        getCitizen(item),
        getPhone(item),
        getDescription(item),
        item.emergencyId,
        item._id,
        item.id,
        item.department,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "All Statuses" ||
        normalizeStatus(item.status) === statusFilter;

      const matchesPriority =
        priorityFilter === "All Priorities" ||
        normalizePriority(item.severity || item.priority) ===
          priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [emergencies, search, statusFilter, priorityFilter]);

  /* =======================================================
     UPDATE EMERGENCY STATUS
  ======================================================= */

  const updateStatus = async (item, newStatus) => {
    const id = getId(item);

    if (!id) {
      setError("This emergency does not have a valid ID.");
      return;
    }

    if (
      !STATUS_OPTIONS.includes(newStatus) ||
      newStatus === "All Statuses"
    ) {
      setError("Please select a valid emergency status.");
      return;
    }

    setUpdatingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/admin/emergencies/${id}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            (response.status === 401 || response.status === 403
              ? "Your admin session is invalid or expired. Please log in again."
              : "Unable to update the emergency status.")
        );
      }

      const updated = result.emergency || result.data || {};

      const updatedEmergency = {
        ...item,
        ...(updated && typeof updated === "object" ? updated : {}),
        status: updated.status || newStatus,
      };

      setEmergencies((previous) =>
        previous.map((entry) =>
          getId(entry) === id
            ? { ...entry, ...updatedEmergency }
            : entry
        )
      );

      setSelectedEmergency((previous) =>
        previous && getId(previous) === id
          ? { ...previous, ...updatedEmergency }
          : previous
      );

      setSuccess(
        `Emergency status updated to ${updatedEmergency.status}.`
      );
    } catch (err) {
      setError(err.message || "Could not update emergency status.");
    } finally {
      setUpdatingId("");
    }
  };

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setPriorityFilter("All Priorities");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="emergencies-page">
      <header className="emergencies-heading">
        <div>
          <span className="emergencies-eyebrow">
            <ShieldAlert size={15} />
            SMARTCITY ADMINISTRATION
          </span>

          <h1>Emergency Management</h1>

          <p>
            Monitor emergency reports, prioritize urgent cases, and track
            response progress.
          </p>
        </div>

        <button
          className="emergencies-btn emergencies-btn-primary"
          onClick={refreshEmergencies}
          disabled={refreshing}
          type="button"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "emergencies-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div
          className="emergencies-alert emergencies-alert-error"
          role="alert"
        >
          <AlertCircle size={19} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          className="emergencies-alert emergencies-alert-success"
          role="status"
        >
          <CheckCircle size={19} />
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <section className="emergencies-stats-grid">
        <article className="emergencies-stat-card">
          <div className="emergencies-stat-icon stat-red">
            <Activity size={23} />
          </div>
          <div className="emergencies-stat-copy">
            <span>Total Emergencies</span>
            <strong>{stats.total}</strong>
            <small>All reported cases</small>
          </div>
        </article>

        <article className="emergencies-stat-card">
          <div className="emergencies-stat-icon stat-orange">
            <Clock size={23} />
          </div>
          <div className="emergencies-stat-copy">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
            <small>Awaiting response</small>
          </div>
        </article>

        <article className="emergencies-stat-card">
          <div className="emergencies-stat-icon stat-blue">
            <AlertTriangle size={23} />
          </div>
          <div className="emergencies-stat-copy">
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
            <small>Assigned or being handled</small>
          </div>
        </article>

        <article className="emergencies-stat-card">
          <div className="emergencies-stat-icon stat-green">
            <CheckCircle size={23} />
          </div>
          <div className="emergencies-stat-copy">
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
            <small>Successfully completed</small>
          </div>
        </article>
      </section>

      {/* CRITICAL ALERT */}

      <section className="emergencies-critical-banner">
        <div className="emergencies-critical-icon">
          <Bell size={22} />
        </div>

        <div className="emergencies-critical-copy">
          <strong>Critical situations</strong>
          <p>
            Review high-priority reports promptly and coordinate the
            appropriate response.
          </p>
        </div>

        <div className="emergencies-critical-count">
          <strong>{stats.critical}</strong>
          <span>Unresolved critical</span>
        </div>
      </section>

      {/* EMERGENCY TABLE */}

      <section className="emergencies-table-card">
        <div className="emergencies-table-heading">
          <div>
            <h2>Emergency Reports</h2>
            <p>Review reports and update their current status.</p>
          </div>

          <span className="emergencies-count-pill">
            {filteredEmergencies.length}{" "}
            {filteredEmergencies.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="emergencies-filters">
          <label className="emergencies-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search reports, citizens, locations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="emergencies-reset-btn"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div className="emergencies-state">
            <RefreshCw className="emergencies-spin" size={27} />
            <strong>Loading emergency reports...</strong>
            <span>Please wait while records are fetched.</span>
          </div>
        ) : (
          <div className="emergencies-table-wrap">
            <table className="emergencies-table">
              <thead>
                <tr>
                  <th>Emergency</th>
                  <th>Citizen</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reported On</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmergencies.map((item) => {
                  const id = getId(item);
                  const priority = normalizePriority(
                    item.severity || item.priority
                  );
                  const status = normalizeStatus(item.status);

                  return (
                    <tr
                      key={id || `${getTitle(item)}-${getDate(item)}`}
                    >
                      <td>
                        <div className="emergencies-name-cell">
                          <span className="emergencies-row-icon">
                            <AlertTriangle size={18} />
                          </span>

                          <div>
                            <strong>{getTitle(item)}</strong>
                            <small>
                              ID:{" "}
                              {item.emergencyId ||
                                String(id || "N/A").slice(-8)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="emergencies-citizen-cell">
                          <strong>{getCitizen(item)}</strong>
                          {getPhone(item) ? (
                            <small>{getPhone(item)}</small>
                          ) : (
                            <small>No phone provided</small>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="emergencies-location-cell">
                          <MapPin size={15} />
                          {getLocation(item)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`emergencies-priority priority-${priority
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          <span className="emergencies-badge-dot" />
                          {priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`emergencies-status status-${status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="emergencies-date">{getDate(item)}</td>

                      <td>
                        <div className="emergencies-row-actions">
                          <button
                            type="button"
                            className="emergencies-icon-btn"
                            onClick={() => setSelectedEmergency(item)}
                            title="View details"
                            aria-label={`View details for ${getTitle(item)}`}
                          >
                            <Eye size={17} />
                          </button>

                          <select
                            className="emergencies-status-select"
                            aria-label={`Update status for ${getTitle(item)}`}
                            value={status}
                            disabled={updatingId === id}
                            onChange={(event) =>
                              updateStatus(item, event.target.value)
                            }
                          >
                            <option value="Reported">Reported</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredEmergencies.length === 0 && (
              <div className="emergencies-state">
                <div className="emergencies-empty-icon">
                  <Search size={25} />
                </div>
                <strong>No emergency reports found</strong>
                <span>
                  Try another search or reset the filters to see all
                  records.
                </span>
                <button
                  type="button"
                  className="emergencies-btn emergencies-btn-light"
                  onClick={resetFilters}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* EMERGENCY DETAILS MODAL */}

      {selectedEmergency && (
        <div
          className="emergencies-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEmergency(null);
            }
          }}
        >
          <section
            className="emergencies-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergencies-modal-title"
          >
            <div className="emergencies-modal-header">
              <div>
                <span className="emergencies-modal-eyebrow">
                  EMERGENCY DETAILS
                </span>
                <h2 id="emergencies-modal-title">
                  {getTitle(selectedEmergency)}
                </h2>
              </div>

              <button
                type="button"
                className="emergencies-modal-close"
                onClick={() => setSelectedEmergency(null)}
                aria-label="Close details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="emergencies-details-banner">
              <div className="emergencies-details-icon">
                <ShieldAlert size={26} />
              </div>

              <div>
                <span>Current status</span>
                <strong>
                  {normalizeStatus(selectedEmergency.status)}
                </strong>
              </div>

              <span
                className={`emergencies-priority priority-${normalizePriority(
                  selectedEmergency.severity || selectedEmergency.priority
                )
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                {normalizePriority(
                  selectedEmergency.severity || selectedEmergency.priority
                )}
              </span>
            </div>

            <div className="emergencies-details-grid">
              <div className="emergencies-detail-item">
                <span>Emergency ID</span>
                <strong>
                  {selectedEmergency.emergencyId ||
                    getId(selectedEmergency)}
                </strong>
              </div>

              <div className="emergencies-detail-item">
                <span>Department</span>
                <strong>
                  {selectedEmergency.department || "Not assigned"}
                </strong>
              </div>

              <div className="emergencies-detail-item">
                <span>Citizen</span>
                <strong>{getCitizen(selectedEmergency)}</strong>
              </div>

              <div className="emergencies-detail-item">
                <span>Reported on</span>
                <strong>{getDate(selectedEmergency)}</strong>
              </div>

              <div className="emergencies-detail-item detail-wide">
                <span>Location</span>
                <strong>
                  <MapPin size={16} />
                  {getLocation(selectedEmergency)}
                </strong>
              </div>

              <div className="emergencies-detail-item detail-wide">
                <span>Contact number</span>
                <strong>
                  <Phone size={16} />
                  {getPhone(selectedEmergency) || "Not provided"}
                </strong>
              </div>

              <div className="emergencies-description-box detail-wide">
                <span>Description</span>
                <p>{getDescription(selectedEmergency)}</p>
              </div>

              {selectedEmergency.responseTeam && (
                <div className="emergencies-detail-item detail-wide">
                  <span>Response team</span>
                  <strong>{selectedEmergency.responseTeam}</strong>
                </div>
              )}

              {selectedEmergency.responseNotes && (
                <div className="emergencies-description-box detail-wide">
                  <span>Response notes</span>
                  <p>{selectedEmergency.responseNotes}</p>
                </div>
              )}
            </div>

            <div className="emergencies-modal-footer">
              <button
                type="button"
                className="emergencies-btn emergencies-btn-light"
                onClick={() => setSelectedEmergency(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="emergencies-btn emergencies-btn-primary"
                disabled={
                  updatingId === getId(selectedEmergency) ||
                  ["Resolved", "Cancelled"].includes(
                    normalizeStatus(selectedEmergency.status)
                  )
                }
                onClick={() =>
                  updateStatus(selectedEmergency, "Resolved")
                }
              >
                <CheckCircle size={17} />
                Mark Resolved
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Emergencies;