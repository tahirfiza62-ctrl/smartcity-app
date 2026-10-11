
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./Complaints.css";

const API_URL = "http://localhost:3000/api/complaints/my";

/* =========================================================
   COMPLAINTS COMPONENT
========================================================= */

const Complaint = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Changing this value triggers a new API request.
  const [refreshKey, setRefreshKey] = useState(0);

  /* =========================================================
     FETCH COMPLAINTS

     This function only fetches and returns data.
     State changes are handled after the request completes.
  ========================================================= */

  const fetchComplaints = useCallback(async (signal) => {
    const token = localStorage.getItem("smartcity_token");

    if (!token) {
      return {
        complaints: null,
        error: "Please login to view your complaints.",
        redirect: true,
      };
    }

    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (signal?.aborted) {
        return null;
      }

      if (response.data?.success) {
        const list = response.data.complaints || [];

        if (!Array.isArray(list)) {
          throw new Error(
            "The server returned an invalid complaints list."
          );
        }

        return {
          complaints: list,
          error: "",
          redirect: false,
        };
      }

      return {
        complaints: [],
        error:
          response.data?.message ||
          "Unable to load your complaints.",
        redirect: false,
      };
    } catch (error) {
      if (
        signal?.aborted ||
        axios.isCancel(error) ||
        error.code === "ERR_CANCELED"
      ) {
        return null;
      }

      console.error(
        "FETCH COMPLAINTS ERROR:",
        error.response?.data || error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("smartcity_token");
        localStorage.removeItem("smartcity_user");

        return {
          complaints: null,
          error:
            error.response?.data?.message ||
            "Your session has expired. Please login again.",
          redirect: true,
        };
      }

      return {
        complaints: [],
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to load complaints.",
        redirect: false,
      };
    }
  }, []);

  /* =========================================================
     LOAD COMPLAINTS

     State updates happen after the asynchronous request.
     The request is cancelled if the component unmounts.
  ========================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const loadComplaints = async () => {
      const result = await fetchComplaints(controller.signal);

      if (!result || controller.signal.aborted) {
        return;
      }

      if (result.redirect) {
        toast.error(result.error);
        navigate("/login", { replace: true });
        return;
      }

      if (result.error) {
        toast.error(result.error);
      }

      setComplaints(result.complaints);
      setLoading(false);
    };

    loadComplaints();

    return () => {
      controller.abort();
    };
  }, [fetchComplaints, navigate, refreshKey]);

  /* =========================================================
     REFRESH COMPLAINTS
  ========================================================= */

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((current) => current + 1);
  };

  /* =========================================================
     FILTER COMPLAINTS

     No extra filtering effect or filtered state is needed.
     useMemo calculates the filtered list from current values.
  ========================================================= */

  const filteredComplaints = useMemo(() => {
    let result = [...complaints];

    // Search
    const query = searchTerm.trim().toLowerCase();

    if (query) {
      result = result.filter((complaint) =>
        [
          complaint.complaintId,
          complaint.subject,
          complaint.category,
          complaint.location,
          complaint.description,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        )
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter(
        (complaint) => complaint.status === statusFilter
      );
    }

    // Category filter
    if (categoryFilter !== "All") {
      result = result.filter(
        (complaint) => complaint.category === categoryFilter
      );
    }

    return result;
  }, [complaints, searchTerm, statusFilter, categoryFilter]);

  /* =========================================================
     STATUS ICON
  ========================================================= */

  const getStatusIcon = (status) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle2 size={14} />;

      case "Rejected":
        return <XCircle size={14} />;

      case "In Progress":
        return <RefreshCw size={14} />;

      case "Under Review":
        return <Clock3 size={14} />;

      default:
        return <FileText size={14} />;
    }
  };

  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {
    switch (status) {
      case "Resolved":
        return "status-resolved";

      case "Rejected":
        return "status-rejected";

      case "In Progress":
        return "status-progress";

      case "Under Review":
        return "status-review";

      default:
        return "status-submitted";
    }
  };

  /* =========================================================
     PRIORITY CLASS
  ========================================================= */

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "priority-high";

      case "Low":
        return "priority-low";

      default:
        return "priority-medium";
    }
  };

  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (complaint) =>
      ["Submitted", "Pending", "Under Review"].includes(
        complaint.status
      )
  ).length;

  const activeComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) =>
      ["Resolved", "Closed"].includes(complaint.status)
  ).length;

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(
    () => [
      ...new Set(
        complaints
          .map((complaint) => complaint.category)
          .filter(Boolean)
      ),
    ],
    [complaints]
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="complaint-page">
      {/* PAGE HEADER */}

      <div className="complaint-page-header">
        <div className="complaint-page-heading">
          <div className="complaint-page-icon">
            <FileText size={23} />
          </div>

          <div>
            <span className="complaint-eyebrow">
              Citizen Services
            </span>

            <p>
              View and track the complaints you have submitted
              to city departments.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="complaint-new-btn"
          onClick={() =>
            navigate("/citizen/submit-complaint")
          }
        >
          <Plus size={17} />
          New Complaint
        </button>
      </div>

      {/* STATISTICS */}

      <div className="complaint-stats">
        <div className="complaint-stat">
          <div className="stat-icon purple">
            <FileText size={18} />
          </div>

          <div>
            <span>Total Complaints</span>
            <strong>{totalComplaints}</strong>
          </div>
        </div>

        <div className="complaint-stat">
          <div className="stat-icon blue">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingComplaints}</strong>
          </div>
        </div>

        <div className="complaint-stat">
          <div className="stat-icon orange">
            <RefreshCw size={18} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{activeComplaints}</strong>
          </div>
        </div>

        <div className="complaint-stat">
          <div className="stat-icon green">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Resolved</span>
            <strong>{resolvedComplaints}</strong>
          </div>
        </div>
      </div>

      {/* COMPLAINT LIST */}

      <section className="complaint-list-card">
        <div className="complaint-list-header">
          <div>
            <h2>Complaint History</h2>

            <p>
              {filteredComplaints.length} complaint
              {filteredComplaints.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <button
            type="button"
            className="complaint-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
            aria-label="Refresh complaints"
          >
            <RefreshCw
              size={16}
              className={
                loading ? "refresh-animation" : ""
              }
            />
          </button>
        </div>

        {/* FILTERS */}

        <div className="complaint-filters">
          <div className="complaint-search">
            <Search size={16} />

            <input
              type="search"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search complaints"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter by status"
          >
            <option value="All">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="complaint-loading">
            <div className="complaint-loader"></div>

            <p>Loading your complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          /* EMPTY STATE */

          <div className="complaint-empty">
            <div className="empty-complaint-icon">
              <FileText size={28} />
            </div>

            <h3>
              {complaints.length === 0
                ? "No Complaints Yet"
                : "No Complaints Found"}
            </h3>

            <p>
              {complaints.length === 0
                ? "You have not submitted any complaints yet."
                : "Try changing your search or filter options."}
            </p>

            {complaints.length === 0 && (
              <button
                type="button"
                className="empty-new-btn"
                onClick={() =>
                  navigate("/citizen/submit-complaint")
                }
              >
                <Plus size={16} />
                Submit Your First Complaint
              </button>
            )}
          </div>
        ) : (
          /* COMPLAINT ITEMS */

          <div className="complaint-items">
            {filteredComplaints.map((complaint, index) => (
              <div
                className="complaint-row"
                key={
                  complaint._id ||
                  complaint.complaintId ||
                  complaint.id ||
                  index
                }
              >
                <div className="complaint-row-left">
                  <div className="complaint-row-icon">
                    <FileText size={18} />
                  </div>

                  <div className="complaint-row-content">
                    <div className="complaint-row-top">
                      <span className="complaint-number">
                        {complaint.complaintId || "No ID"}
                      </span>

                      <span
                        className={`complaint-status ${getStatusClass(
                          complaint.status
                        )}`}
                      >
                        {getStatusIcon(complaint.status)}
                        {complaint.status || "Pending"}
                      </span>
                    </div>

                    <h3>
                      {complaint.subject ||
                        complaint.title ||
                        "Untitled Complaint"}
                    </h3>

                    <div className="complaint-details">
                      <span>
                        <FileText size={12} />
                        {complaint.category || "Uncategorized"}
                      </span>

                      <span>
                        <MapPin size={12} />
                        {complaint.location || "Location not provided"}
                      </span>

                      <span>
                        {formatDate(complaint.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="complaint-row-right">
                  <span
                    className={`complaint-priority ${getPriorityClass(
                      complaint.priority
                    )}`}
                  >
                    {complaint.priority || "Medium"}
                  </span>

                  <button
                    type="button"
                    className="complaint-view-btn"
                    onClick={() =>
                      navigate(
                        `/citizen/complaints/${encodeURIComponent(
                          complaint.complaintId ||
                            complaint._id ||
                            complaint.id
                        )}`
                      )
                    }
                  >
                    View
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* INFORMATION */}

      <div className="complaint-bottom-info">
        <AlertCircle size={16} />

        <p>
          Complaint status is updated by the relevant city department.
          Check this page regularly to track the progress of your
          complaints.
        </p>
      </div>
    </main>
  );
};

export default Complaint;