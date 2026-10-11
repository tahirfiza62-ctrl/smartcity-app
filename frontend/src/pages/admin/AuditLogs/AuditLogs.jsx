
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

import "./AuditLogs.css";

const API_URL = "http://localhost:3000/api/admin";

const EMPTY_STATS = {
  total: 0,
  successful: 0,
  failed: 0,
  today: 0,
};

const EMPTY_PAGINATION = {
  total: 0,
  totalPages: 1,
};

function getAdminToken() {
  return (
    localStorage.getItem("smartcity_admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getActionClass(action = "") {
  const value = String(action).toLowerCase();

  if (value.includes("delete") || value.includes("remove")) {
    return "audit-action audit-action-danger";
  }

  if (value.includes("create") || value.includes("add")) {
    return "audit-action audit-action-create";
  }

  if (value.includes("update") || value.includes("edit")) {
    return "audit-action audit-action-update";
  }

  if (value.includes("login") || value.includes("logout")) {
    return "audit-action audit-action-auth";
  }

  return "audit-action";
}

function getRequestError(data, fallback) {
  return data?.message || fallback;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [module, setModule] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /*
   * Fetch data without setting React state inside this function.
   * This keeps the request logic separate from state updates.
   */
  const fetchAuditLogs = useCallback(async (signal) => {
    const token = getAdminToken();

    const params = new URLSearchParams({
      search,
      action,
      module,
      status,
      page: String(page),
      limit: "20",
    });

    const headers = {
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const [logsResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/audit-logs?${params}`, {
          headers,
          signal,
        }),
        fetch(`${API_URL}/audit-logs/stats`, {
          headers,
          signal,
        }),
      ]);

      const [logsData, statsData] = await Promise.all([
        logsResponse.json().catch(() => ({})),
        statsResponse.json().catch(() => ({})),
      ]);

      if (!logsResponse.ok) {
        throw new Error(
          getRequestError(
            logsData,
            "Could not load audit logs."
          )
        );
      }

      if (!statsResponse.ok) {
        throw new Error(
          getRequestError(
            statsData,
            "Could not load audit statistics."
          )
        );
      }

      return {
        success: true,
        logs: Array.isArray(logsData.logs)
          ? logsData.logs
          : [],
        pagination: logsData.pagination || EMPTY_PAGINATION,
        stats: statsData.stats || EMPTY_STATS,
        error: "",
      };
    } catch (err) {
      if (err.name === "AbortError") {
        return null;
      }

      console.error("FETCH AUDIT LOGS ERROR:", err);

      return {
        success: false,
        logs: [],
        pagination: EMPTY_PAGINATION,
        stats: null,
        error: err.message || "Something went wrong.",
      };
    }
  }, [search, action, module, status, page]);

  /*
   * Initial loading and filter changes.
   * State updates occur after awaiting the asynchronous request.
   */
  useEffect(() => {
    const controller = new AbortController();

    const loadAuditLogs = async () => {
      const result = await fetchAuditLogs(controller.signal);

      if (!result || controller.signal.aborted) {
        return;
      }

      setLogs(result.logs);
      setPagination(result.pagination);
      setError(result.error);

      if (result.success) {
        setStats(result.stats);
      }

      setLoading(false);
      setRefreshing(false);
    };

    loadAuditLogs();

    return () => {
      controller.abort();
    };
  }, [fetchAuditLogs, refreshKey]);

  /*
   * Filter changes reset pagination in the event handler,
   * rather than using a separate effect.
   */
  function handleFilterChange(setter, value) {
    setter(value);
    setPage(1);
  }

  /*
   * Refresh by changing a dependency. The effect handles the request.
   */
  function refreshLogs() {
    setRefreshing(true);
    setError("");
    setRefreshKey((current) => current + 1);
  }

  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) || 1
  );

  return (
    <main className="audit-page">
      {/* PAGE HEADER */}

      <header className="audit-page-header">
        <div className="audit-heading">
          <div className="audit-heading-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h1>Audit Logs</h1>
            <p>
              Monitor administrative activities and system events.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="audit-refresh-btn"
          onClick={refreshLogs}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing || loading ? "audit-spinning" : ""
            }
          />
          Refresh
        </button>
      </header>

      {/* STATISTICS */}

      <section className="audit-stats-grid">
        <article className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-blue">
            <ClipboardList size={21} />
          </div>

          <div>
            <span>Total Logs</span>
            <strong>{stats.total}</strong>
          </div>
        </article>

        <article className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Successful</span>
            <strong>{stats.successful}</strong>
          </div>
        </article>

        <article className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-red">
            <AlertCircle size={21} />
          </div>

          <div>
            <span>Failed</span>
            <strong>{stats.failed}</strong>
          </div>
        </article>

        <article className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-purple">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Today's Activity</span>
            <strong>{stats.today}</strong>
          </div>
        </article>
      </section>

      {/* AUDIT LOGS */}

      <section className="audit-content-card">
        <div className="audit-content-heading">
          <div>
            <h2>Activity History</h2>
            <p>
              Search and filter recorded administrative actions.
            </p>
          </div>

          <span className="audit-total-label">
            {pagination.total || 0} records
          </span>
        </div>

        {/* FILTERS */}

        <div className="audit-filters">
          <div className="audit-search-box">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search users, actions, descriptions..."
              value={search}
              onChange={(event) =>
                handleFilterChange(
                  setSearch,
                  event.target.value
                )
              }
            />
          </div>

          <select
            aria-label="Filter by action"
            value={action}
            onChange={(event) =>
              handleFilterChange(
                setAction,
                event.target.value
              )
            }
          >
            <option value="">All actions</option>
            <option value="Create">Create</option>
            <option value="Update">Update</option>
            <option value="Delete">Delete</option>
            <option value="Login">Login</option>
            <option value="Logout">Logout</option>
          </select>

          <select
            aria-label="Filter by module"
            value={module}
            onChange={(event) =>
              handleFilterChange(
                setModule,
                event.target.value
              )
            }
          >
            <option value="">All modules</option>
            <option value="Complaints">Complaints</option>
            <option value="Departments">Departments</option>
            <option value="Users">Users</option>
            <option value="Assets">Assets</option>
            <option value="Emergencies">Emergencies</option>
            <option value="Authentication">Authentication</option>
            <option value="System">System</option>
          </select>

          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) =>
              handleFilterChange(
                setStatus,
                event.target.value
              )
            }
          >
            <option value="">All statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* ERROR */}

        {error && (
          <div className="audit-error">
            <AlertCircle size={19} />

            <div>
              <strong>Audit logs could not be loaded</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={refreshLogs}
              disabled={refreshing}
            >
              Try again
            </button>
          </div>
        )}

        {/* TABLE */}

        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Administrator</th>
                <th>Module</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="audit-table-message"
                  >
                    <RefreshCw
                      size={22}
                      className="audit-spinning"
                    />
                    <span>Loading audit logs...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="audit-table-message"
                  >
                    Unable to display records.
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="audit-table-message"
                  >
                    <Activity size={25} />
                    <strong>No audit logs found</strong>
                    <span>
                      Logs will appear here when administrative
                      actions are recorded.
                    </span>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <span className={getActionClass(log.action)}>
                        {log.action || "Activity"}
                      </span>
                    </td>

                    <td>
                      <div className="audit-admin-cell">
                        <strong>
                          {log.actorName || "System"}
                        </strong>
                        <span>{log.actorEmail || "—"}</span>
                      </div>
                    </td>

                    <td>
                      <span className="audit-module">
                        {log.module || "—"}
                      </span>
                    </td>

                    <td>
                      <div className="audit-description">
                        <span>{log.description || "—"}</span>

                        {log.targetId && (
                          <small>
                            Reference: {log.targetId}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`audit-status ${
                          log.status === "Failed"
                            ? "audit-status-failed"
                            : "audit-status-success"
                        }`}
                      >
                        {log.status || "Success"}
                      </span>
                    </td>

                    <td className="audit-date">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <footer className="audit-pagination">
          <span>
            Page {Math.min(page, totalPages)} of {totalPages}
          </span>

          <div>
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

