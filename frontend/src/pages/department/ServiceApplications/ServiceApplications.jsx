import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ClipboardList,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  CalendarDays,
  CreditCard,
  FileText,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import "./ServiceApplications.css";

const API_URL = "http://localhost:3000";

/* =========================================================
   TOKEN
========================================================= */

const getToken = () => {
  return localStorage.getItem("department_token");
};

/* =========================================================
   AXIOS CONFIG
========================================================= */

const getConfig = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/* =========================================================
   STATUS CLASS
========================================================= */

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "submitted":
      return "submitted";

    case "under review":
      return "under-review";

    case "processing":
      return "processing";

    case "approved":
      return "approved";

    case "rejected":
      return "rejected";

    case "completed":
      return "completed";

    case "cancelled":
      return "cancelled";

    default:
      return "default";
  }
};

/* =========================================================
   STATUS ICON
========================================================= */

const StatusIcon = ({ status }) => {
  switch (status?.toLowerCase()) {
    case "submitted":
      return <Clock size={15} />;

    case "under review":
      return <AlertCircle size={15} />;

    case "processing":
      return <RefreshCw size={15} />;

    case "approved":
      return <CheckCircle size={15} />;

    case "completed":
      return <CheckCircle size={15} />;

    case "rejected":
      return <XCircle size={15} />;

    case "cancelled":
      return <XCircle size={15} />;

    default:
      return <Clock size={15} />;
  }
};

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (date) => {
  if (!date) return "N/A";

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
   MAIN COMPONENT
========================================================= */

const ServicesApplications = () => {
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [department, setDepartment] =
    useState("");

  /* =======================================================
     FETCH APPLICATIONS
  ======================================================= */

  const fetchApplications = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(
        `${API_URL}/api/service-requests/department/all`,
        getConfig()
      );

      const data = response.data;

      const list =
        data.serviceRequests ||
        data.applications ||
        data.requests ||
        data.data ||
        [];

      setApplications(
        Array.isArray(list)
          ? list
          : []
      );

      setDepartment(
        data.department || ""
      );
    } catch (error) {
      console.error(
        "Fetch applications error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        toast.error(
          "Session expired. Please login again."
        );
      } else if (
        error.response?.status === 403
      ) {
        toast.error(
          "You do not have department access."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to load service applications."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    fetchApplications();
  }, []);

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (
    id,
    newStatus
  ) => {
    try {
      setUpdatingId(id);

      await axios.patch(
        `${API_URL}/api/service-requests/department/${id}/status`,
        {
          status: newStatus,
        },
        getConfig()
      );

      toast.success(
        "Application status updated."
      );

      await fetchApplications(true);
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =======================================================
     FILTER APPLICATIONS
  ======================================================= */

  const filteredApplications =
    useMemo(() => {
      return applications.filter(
        (application) => {
          const status =
            application.status || "";

          const citizenName =
            application.citizenName ||
            application.citizen?.name ||
            "";

          const serviceName =
            application.serviceName ||
            "";

          const requestId =
            application.requestId ||
            "";

          const title =
            application.title ||
            "";

          const searchText =
            `${citizenName} ${serviceName} ${requestId} ${title}`
              .toLowerCase();

          const matchesSearch =
            searchText.includes(
              search.toLowerCase()
            );

          const matchesStatus =
            statusFilter === "All" ||
            status === statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      applications,
      search,
      statusFilter,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total =
      applications.length;

    const submitted =
      applications.filter(
        (item) =>
          item.status === "Submitted"
      ).length;

    const underReview =
      applications.filter(
        (item) =>
          item.status ===
          "Under Review"
      ).length;

    const processing =
      applications.filter(
        (item) =>
          item.status ===
          "Processing"
      ).length;

    const approved =
      applications.filter(
        (item) =>
          item.status === "Approved"
      ).length;

    const completed =
      applications.filter(
        (item) =>
          item.status ===
          "Completed"
      ).length;

    const rejected =
      applications.filter(
        (item) =>
          item.status === "Rejected"
      ).length;

    return {
      total,
      submitted,
      underReview,
      processing,
      approved,
      completed,
      rejected,
    };
  }, [applications]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="service-applications-page">
        <div className="service-loading">
          <div className="loading-spinner"></div>
          <p>
            Loading service applications...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="service-applications-page">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="service-page-header">

        <div className="service-header-left">

          <div className="service-header-icon">
            <ClipboardList size={30} />
          </div>

          <div>
            <span className="service-eyebrow">
              DEPARTMENT PORTAL
            </span>

            <h1>
              Service Applications
            </h1>

            <p>
              Review and process citizen
              service applications assigned
              to your department.
            </p>

            {department && (
              <div className="department-badge">
                <span>
                  Department:
                </span>

                <strong>
                  {department}
                </strong>
              </div>
            )}
          </div>

        </div>

        <button
          className="refresh-button"
          onClick={() =>
            fetchApplications(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "spinning"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="service-stats-grid">

        <div className="service-stat-card">
          <div className="stat-icon total">
            <ClipboardList size={21} />
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-icon submitted">
            <Clock size={21} />
          </div>

          <div>
            <span>
              Submitted
            </span>

            <strong>
              {stats.submitted}
            </strong>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-icon review">
            <AlertCircle size={21} />
          </div>

          <div>
            <span>
              Under Review
            </span>

            <strong>
              {stats.underReview}
            </strong>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-icon processing">
            <RefreshCw size={21} />
          </div>

          <div>
            <span>
              Processing
            </span>

            <strong>
              {stats.processing}
            </strong>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>
              Approved
            </span>

            <strong>
              {stats.approved}
            </strong>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {stats.completed}
            </strong>
          </div>
        </div>

      </div>

      {/* ===================================================
          FILTER BAR
      =================================================== */}

      <div className="service-filter-bar">

        <div className="service-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        <div className="service-filter-select">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
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

            <option value="Processing">
              Processing
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Rejected">
              Rejected
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Cancelled">
              Cancelled
            </option>
          </select>

          <ChevronDown size={17} />
        </div>

      </div>

      {/* ===================================================
          APPLICATIONS
      =================================================== */}

      {filteredApplications.length === 0 ? (
        <div className="empty-applications">

          <div className="empty-icon">
            <ClipboardList size={38} />
          </div>

          <h3>
            No service applications found
          </h3>

          <p>
            There are currently no
            applications matching your
            search or filter.
          </p>

        </div>
      ) : (
        <div className="applications-list">

          {filteredApplications.map(
            (application) => {

              const status =
                application.status ||
                "Submitted";

              const citizenName =
                application.citizenName ||
                application.citizen?.name ||
                "Citizen";

              const citizenEmail =
                application.citizenEmail ||
                application.citizen?.email ||
                "N/A";

              return (
                <div
                  className="application-card"
                  key={
                    application._id
                  }
                >

                  {/* ========================================
                      TOP
                  ======================================== */}

                  <div className="application-card-top">

                    <div className="application-title-area">

                      <div className="application-icon">
                        <FileText size={22} />
                      </div>

                      <div>

                        <span className="application-request-id">
                          {application.requestId ||
                            "N/A"}
                        </span>

                        <h3>
                          {application.serviceName ||
                            application.title ||
                            "Citizen Service"}
                        </h3>

                      </div>

                    </div>

                    <div
                      className={`application-status ${getStatusClass(
                        status
                      )}`}
                    >
                      <StatusIcon
                        status={status}
                      />

                      <span>
                        {status}
                      </span>
                    </div>

                  </div>

                  {/* ========================================
                      BODY
                  ======================================== */}

                  <div className="application-body">

                    <div className="application-info-grid">

                      <div className="application-info">

                        <span>
                          <User size={15} />
                          Citizen
                        </span>

                        <strong>
                          {citizenName}
                        </strong>

                        <small>
                          {citizenEmail}
                        </small>

                      </div>

                      <div className="application-info">

                        <span>
                          <MapPin size={15} />
                          Location
                        </span>

                        <strong>
                          {application.location ||
                            "N/A"}
                        </strong>

                      </div>

                      <div className="application-info">

                        <span>
                          <CalendarDays size={15} />
                          Submitted
                        </span>

                        <strong>
                          {formatDate(
                            application.createdAt
                          )}
                        </strong>

                      </div>

                      <div className="application-info">

                        <span>
                          <CreditCard size={15} />
                          Amount
                        </span>

                        <strong>
                          Rs.{" "}
                          {Number(
                            application.amount ||
                              0
                          ).toLocaleString()}
                        </strong>

                        <small>
                          {application.paymentStatus ||
                            "Pending"}
                        </small>

                      </div>

                    </div>

                    {/* ======================================
                        DESCRIPTION
                    ====================================== */}

                    {application.description && (
                      <div className="application-description">

                        <span>
                          Description
                        </span>

                        <p>
                          {application.description}
                        </p>

                      </div>
                    )}

                  </div>

                  {/* ========================================
                      FOOTER
                  ======================================== */}

                  <div className="application-card-footer">

                    <div className="priority-section">

                      <span>
                        Priority
                      </span>

                      <strong
                        className={`priority-${(
                          application.priority ||
                          "Medium"
                        ).toLowerCase()}`}
                      >
                        {application.priority ||
                          "Medium"}
                      </strong>

                    </div>

                    <div className="application-actions">

                      <label>
                        Update Status
                      </label>

                      <select
                        value={status}
                        onChange={(e) =>
                          updateStatus(
                            application._id,
                            e.target.value
                          )
                        }
                        disabled={
                          updatingId ===
                          application._id
                        }
                      >

                        <option value="Submitted">
                          Submitted
                        </option>

                        <option value="Under Review">
                          Under Review
                        </option>

                        <option value="Processing">
                          Processing
                        </option>

                        <option value="Approved">
                          Approved
                        </option>

                        <option value="Rejected">
                          Rejected
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
};

export default ServicesApplications;