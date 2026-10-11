
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  LoaderCircle,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Analytics.css";

const API_URL = "http://localhost:3000/api";

const COLORS = {
  red: "#D71920",
  blue: "#334E68",
  green: "#16A34A",
  orange: "#EA580C",
  purple: "#7C3AED",
  grey: "#94A3B8",
};

const STATUS_COLORS = {
  pending: "#EA580C",
  submitted: "#EA580C",
  open: "#D71920",
  assigned: "#7C3AED",
  "in progress": "#2563EB",
  processing: "#2563EB",
  resolved: "#16A34A",
  completed: "#16A34A",
  closed: "#16A34A",
  rejected: "#64748B",
  cancelled: "#64748B",
};

/* =========================================================
   HELPERS
========================================================= */

const getToken = () =>
  localStorage.getItem("smartcity_admin_token") ||
  localStorage.getItem("adminToken") ||
  localStorage.getItem("admin_token") ||
  localStorage.getItem("token");

const getStatus = (complaint) =>
  String(complaint.status || "Pending").trim();

const normalizeStatus = (status) => String(status).toLowerCase();

const getComplaintDepartment = (complaint) =>
  complaint.departmentName ||
  complaint.department?.name ||
  complaint.department ||
  complaint.category ||
  "Unassigned";

const getDate = (complaint) => {
  const value =
    complaint.createdAt ||
    complaint.submittedAt ||
    complaint.date;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const isResolved = (complaint) =>
  ["resolved", "completed", "closed"].includes(
    normalizeStatus(getStatus(complaint))
  );

const isOpen = (complaint) =>
  !isResolved(complaint) &&
  !["rejected", "cancelled"].includes(
    normalizeStatus(getStatus(complaint))
  );

const escapeCsv = (value) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

/* =========================================================
   ANALYTICS COMPONENT
========================================================= */

const Analytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("30");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Changing this value triggers a fresh API request.
  const [refreshKey, setRefreshKey] = useState(0);

  /* =======================================================
     FETCH ANALYTICS DATA

     This function only fetches and returns data.
     It does not call setState.
  ======================================================= */

  const fetchAnalytics = useCallback(async (signal) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin session not found. Please log in to the admin panel."
        );
      }

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [complaintResponse, departmentResponse] =
        await Promise.all([
          fetch(`${API_URL}/admin/complaints`, {
            headers,
            signal,
          }),
          fetch(`${API_URL}/admin/departments`, {
            headers,
            signal,
          }),
        ]);

      const [complaintData, departmentData] = await Promise.all([
        complaintResponse.json().catch(() => ({})),
        departmentResponse.json().catch(() => ({})),
      ]);

      if (signal?.aborted) {
        return null;
      }

      if (
        complaintResponse.status === 401 ||
        complaintResponse.status === 403 ||
        departmentResponse.status === 401 ||
        departmentResponse.status === 403
      ) {
        throw new Error(
          "Your admin session may have expired. Please log in again."
        );
      }

      if (!complaintResponse.ok) {
        throw new Error(
          complaintData.message ||
            "Unable to load complaint analytics."
        );
      }

      if (!departmentResponse.ok) {
        throw new Error(
          departmentData.message ||
            "Unable to load department analytics."
        );
      }

      const complaintList = Array.isArray(complaintData)
        ? complaintData
        : complaintData.complaints ||
          complaintData.data?.complaints ||
          complaintData.data ||
          [];

      const departmentList = Array.isArray(departmentData)
        ? departmentData
        : departmentData.departments ||
          departmentData.data?.departments ||
          departmentData.data ||
          [];

      if (
        !Array.isArray(complaintList) ||
        !Array.isArray(departmentList)
      ) {
        throw new Error(
          "The server returned an unexpected analytics response."
        );
      }

      return {
        complaints: complaintList,
        departments: departmentList,
        lastUpdated: new Date(),
        error: "",
      };
    } catch (err) {
      if (err.name === "AbortError") {
        return null;
      }

      console.error("ANALYTICS FETCH ERROR:", err);

      return {
        complaints: null,
        departments: null,
        lastUpdated: null,
        error:
          err.message ||
          "Unable to load analytics. Please try again.",
      };
    }
  }, []);

  /* =======================================================
     LOAD ANALYTICS

     State updates happen after the asynchronous request
     returns, avoiding the set-state-in-effect warning.
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const loadAnalytics = async () => {
      const result = await fetchAnalytics(controller.signal);

      if (!result || controller.signal.aborted) {
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setComplaints(result.complaints);
        setDepartments(result.departments);
        setLastUpdated(result.lastUpdated);
        setError("");
      }

      setLoading(false);
      setRefreshing(false);
    };

    loadAnalytics();

    return () => {
      controller.abort();
    };
  }, [fetchAnalytics, refreshKey]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshAnalytics = () => {
    setRefreshing(true);
    setError("");
    setRefreshKey((current) => current + 1);
  };

  /* =======================================================
     FILTER COMPLAINTS BY SELECTED PERIOD
  ======================================================= */

  const filteredComplaints = useMemo(() => {
    const days = Number(period);
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    return complaints.filter((complaint) => {
      const date = getDate(complaint);
      return date && date >= cutoff;
    });
  }, [complaints, period]);

  /* =======================================================
     SUMMARY STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const total = filteredComplaints.length;

    const resolved = filteredComplaints.filter(isResolved).length;

    const open = filteredComplaints.filter(isOpen).length;

    const highPriority = filteredComplaints.filter(
      (complaint) =>
        String(complaint.priority || "").toLowerCase() === "high"
    ).length;

    return {
      total,
      resolved,
      open,
      highPriority,
      resolutionRate: total
        ? Math.round((resolved / total) * 100)
        : 0,
    };
  }, [filteredComplaints]);

  /* =======================================================
     STATUS CHART DATA
  ======================================================= */

  const statusData = useMemo(() => {
    const counts = {};

    filteredComplaints.forEach((complaint) => {
      const status = getStatus(complaint);
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color:
        STATUS_COLORS[normalizeStatus(name)] || COLORS.grey,
    }));
  }, [filteredComplaints]);

  /* =======================================================
     PRIORITY CHART DATA
  ======================================================= */

  const priorityData = useMemo(() => {
    const priorities = ["High", "Medium", "Low"];

    return priorities.map((priority) => ({
      name: priority,
      complaints: filteredComplaints.filter(
        (complaint) =>
          String(complaint.priority || "Medium").toLowerCase() ===
          priority.toLowerCase()
      ).length,
      fill:
        priority === "High"
          ? COLORS.red
          : priority === "Medium"
            ? COLORS.orange
            : COLORS.blue,
    }));
  }, [filteredComplaints]);

  /* =======================================================
     DEPARTMENT CHART DATA
  ======================================================= */

  const departmentData = useMemo(() => {
    const counts = new Map();

    departments.forEach((department) => {
      counts.set(department.name || "Unnamed", {
        name: department.name || "Unnamed",
        total: 0,
        resolved: 0,
      });
    });

    filteredComplaints.forEach((complaint) => {
      const name = getComplaintDepartment(complaint);

      const current = counts.get(name) || {
        name,
        total: 0,
        resolved: 0,
      };

      current.total += 1;

      if (isResolved(complaint)) {
        current.resolved += 1;
      }

      counts.set(name, current);
    });

    return Array.from(counts.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [departments, filteredComplaints]);

  /* =======================================================
     DAILY TREND DATA
  ======================================================= */

  const trendData = useMemo(() => {
    const days = Number(period);
    const count = days <= 7 ? 7 : days <= 30 ? 30 : 90;
    const result = [];
    const today = new Date();

    for (let i = count - 1; i >= 0; i -= 1) {
      const date = new Date(today);

      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      result.push({
        key: date.toISOString().slice(0, 10),
        date,
        name:
          count === 7
            ? date.toLocaleDateString("en", {
                weekday: "short",
              })
            : date.toLocaleDateString("en", {
                day: "numeric",
                month: "short",
              }),
        complaints: 0,
        resolved: 0,
      });
    }

    const byDate = new Map(
      result.map((item) => [item.key, item])
    );

    filteredComplaints.forEach((complaint) => {
      const date = getDate(complaint);

      if (!date) return;

      const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const key = localDate.toISOString().slice(0, 10);
      const day = byDate.get(key);

      if (!day) return;

      day.complaints += 1;

      if (isResolved(complaint)) {
        day.resolved += 1;
      }
    });

    return result;
  }, [filteredComplaints, period]);

  /* =======================================================
     EXPORT CSV
  ======================================================= */

  const exportCsv = () => {
    const headers = [
      "Subject",
      "Department",
      "Status",
      "Priority",
      "Location",
      "Created At",
    ];

    const rows = filteredComplaints.map((complaint) => [
      complaint.subject || complaint.title || "",
      getComplaintDepartment(complaint),
      getStatus(complaint),
      complaint.priority || "Medium",
      complaint.location || "",
      getDate(complaint)?.toLocaleString() || "",
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `smartcity-analytics-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  /* =======================================================
     INITIAL LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="analytics-loading">
        <LoaderCircle className="analytics-spin" size={36} />
        <p>Loading SmartCity analytics...</p>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD UI
  ======================================================= */

  return (
    <main className="analytics-page">
      <header className="analytics-header">
        <div className="analytics-title-group">
          <div className="analytics-title-icon">
            <BarChart3 size={27} />
          </div>

          <div>
            <h1>Analytics & Reports</h1>
            <p>
              Monitor complaints, department performance, and
              resolution progress.
            </p>
          </div>
        </div>

        <div className="analytics-header-actions">
          <select
            className="analytics-period-select"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Analytics date range"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <button
            type="button"
            className="analytics-action-button"
            onClick={refreshAnalytics}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "analytics-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="analytics-export-button"
            onClick={exportCsv}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      {lastUpdated && (
        <p className="analytics-updated">
          <Activity size={14} />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {error && (
        <div className="analytics-error" role="alert">
          <AlertTriangle size={20} />

          <div>
            <strong>Analytics could not be loaded</strong>
            <p>{error}</p>

            <button
              type="button"
              onClick={refreshAnalytics}
              disabled={refreshing}
            >
              {refreshing ? "Retrying..." : "Try again"}
            </button>
          </div>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <section className="analytics-stats-grid">
        <StatCard
          title="Total Complaints"
          value={stats.total}
          subtitle={`In the last ${period} days`}
          icon={<FileText size={22} />}
          color="blue"
        />

        <StatCard
          title="Resolved Complaints"
          value={stats.resolved}
          subtitle="Completed or closed"
          icon={<CheckCircle2 size={22} />}
          color="green"
        />

        <StatCard
          title="Open Complaints"
          value={stats.open}
          subtitle="Still requiring attention"
          icon={<Clock size={22} />}
          color="orange"
        />

        <StatCard
          title="High Priority"
          value={stats.highPriority}
          subtitle="High-priority complaints"
          icon={<AlertTriangle size={22} />}
          color="red"
        />
      </section>

      {/* RESOLUTION RATE */}

      <section className="analytics-resolution-panel">
        <div className="analytics-resolution-icon">
          <TrendingUp size={22} />
        </div>

        <div className="analytics-resolution-content">
          <div className="analytics-resolution-heading">
            <div>
              <h3>Resolution Rate</h3>
              <p>Share of complaints resolved in this period</p>
            </div>

            <strong>{stats.resolutionRate}%</strong>
          </div>

          <div
            className="analytics-progress-track"
            role="progressbar"
            aria-label="Complaint resolution rate"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.resolutionRate}
          >
            <div
              className="analytics-progress-fill"
              style={{ width: `${stats.resolutionRate}%` }}
            />
          </div>
        </div>
      </section>

      {/* TRENDS AND STATUS CHARTS */}

      <section className="analytics-chart-grid">
        <div className="analytics-panel analytics-trend-panel">
          <PanelHeading
            title="Complaint Trends"
            subtitle="Daily submissions and resolutions"
            icon={<TrendingUp size={19} />}
          />

          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{
                  top: 12,
                  right: 10,
                  left: -18,
                  bottom: 4,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E8EDF3"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={
                    period === "90" ? 8 : period === "30" ? 4 : 0
                  }
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />
                <Legend />

                <Bar
                  dataKey="complaints"
                  name="Submitted"
                  fill={COLORS.blue}
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="resolved"
                  name="Resolved"
                  fill={COLORS.green}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-panel analytics-status-panel">
          <PanelHeading
            title="Complaint Status"
            subtitle="Current workflow distribution"
            icon={<Activity size={19} />}
          />

          {statusData.length ? (
            <>
              <div className="analytics-pie-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={64}
                      outerRadius={94}
                      paddingAngle={3}
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="analytics-status-legend">
                {statusData.map((item) => (
                  <div key={item.name}>
                    <span>
                      <i style={{ background: item.color }} />
                      {item.name}
                    </span>

                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState message="No complaints found for this period." />
          )}
        </div>
      </section>

      {/* DEPARTMENT AND PRIORITY CHARTS */}

      <section className="analytics-chart-grid">
        <div className="analytics-panel">
          <PanelHeading
            title="Department Performance"
            subtitle="Complaint volume and resolved cases"
            icon={<Building2 size={19} />}
          />

          {departmentData.length ? (
            <div className="analytics-department-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 15,
                    left: 12,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#E8EDF3"
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: "#475569", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="total"
                    name="Total"
                    fill={COLORS.blue}
                    radius={[0, 4, 4, 0]}
                  />

                  <Bar
                    dataKey="resolved"
                    name="Resolved"
                    fill={COLORS.green}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No department data available." />
          )}
        </div>

        <div className="analytics-panel">
          <PanelHeading
            title="Priority Breakdown"
            subtitle="Complaints by urgency level"
            icon={<AlertTriangle size={19} />}
          />

          <div className="analytics-priority-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                margin={{
                  top: 12,
                  right: 8,
                  left: -18,
                  bottom: 4,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E8EDF3"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="complaints"
                  name="Complaints"
                  radius={[6, 6, 0, 0]}
                >
                  {priorityData.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* RECENT COMPLAINTS TABLE */}

      <section className="analytics-panel analytics-table-panel">
        <PanelHeading
          title="Recent Complaints"
          subtitle={`${filteredComplaints.length} complaints in the selected period`}
          icon={<ClipboardListIcon />}
        />

        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Complaint</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredComplaints.length ? (
                [...filteredComplaints]
                  .sort((a, b) => {
                    const dateA = getDate(a)?.getTime() || 0;
                    const dateB = getDate(b)?.getTime() || 0;
                    return dateB - dateA;
                  })
                  .slice(0, 10)
                  .map((complaint, index) => (
                    <tr
                      key={
                        complaint._id ||
                        complaint.id ||
                        `${complaint.subject}-${index}`
                      }
                    >
                      <td>
                        <strong>
                          {complaint.subject ||
                            complaint.title ||
                            "Untitled complaint"}
                        </strong>

                        <small>
                          {complaint.location || "No location provided"}
                        </small>
                      </td>

                      <td>{getComplaintDepartment(complaint)}</td>

                      <td>
                        <span
                          className={`analytics-priority-badge analytics-priority-${String(
                            complaint.priority || "Medium"
                          ).toLowerCase()}`}
                        >
                          {complaint.priority || "Medium"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="analytics-status-badge"
                          style={{
                            "--status-color":
                              STATUS_COLORS[
                                normalizeStatus(getStatus(complaint))
                              ] || COLORS.grey,
                          }}
                        >
                          {getStatus(complaint)}
                        </span>
                      </td>

                      <td>
                        {getDate(complaint)
                          ? getDate(complaint).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="analytics-empty-cell">
                    No complaints found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="analytics-footer">
        <Activity size={15} />
        Analytics are calculated from the complaint records returned
        by your SmartCity backend.
      </footer>
    </main>
  );
};

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <article className={`analytics-stat-card analytics-stat-${color}`}>
    <div className="analytics-stat-top">
      <span>{title}</span>
      <div className="analytics-stat-icon">{icon}</div>
    </div>

    <strong className="analytics-stat-value">
      {value.toLocaleString()}
    </strong>

    <p>{subtitle}</p>
  </article>
);

const PanelHeading = ({ title, subtitle, icon }) => (
  <div className="analytics-panel-heading">
    <div className="analytics-panel-heading-icon">{icon}</div>

    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="analytics-empty-state">
    <XCircle size={25} />
    <p>{message}</p>
  </div>
);

const ClipboardListIcon = () => <FileText size={19} />;

export default Analytics;