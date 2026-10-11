import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Tag,
  Building2,
  AlertCircle,
  FileText,
  Clock,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import "./ComplaintDetails.css";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* =====================================================
     FETCH COMPLAINT
  ===================================================== */

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token =
          localStorage.getItem("smartcity_token");

        console.log(
          "========== COMPLAINT DETAILS =========="
        );
        console.log("Complaint ID:", id);
        console.log("Token exists:", !!token);

        if (!token) {
          console.error(
            "smartcity_token NOT FOUND"
          );

          setErrorMessage(
            "Your login session is missing. Please login again."
          );

          setTimeout(() => {
            navigate("/login");
          }, 1500);

          return;
        }

        const response = await axios.get(
          `http://localhost:3000/api/complaints/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Complaint response:",
          response.data
        );

        if (response.data.success) {
          setComplaint(
            response.data.complaint
          );
        } else {
          setErrorMessage(
            response.data.message ||
              "Unable to load complaint."
          );
        }
      } catch (error) {
        console.error(
          "COMPLAINT DETAILS ERROR:",
          error
        );

        console.log(
          "Backend response:",
          error.response?.data
        );

        console.log(
          "Backend status:",
          error.response?.status
        );

        if (error.response?.status === 401) {
          localStorage.removeItem(
            "smartcity_token"
          );

          localStorage.removeItem(
            "smartcity_user"
          );

          setErrorMessage(
            "Your login session has expired. Please login again."
          );

          setTimeout(() => {
            navigate("/login");
          }, 1500);

          return;
        }

        if (error.response?.status === 404) {
          setErrorMessage(
            "Complaint not found."
          );
          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
            "Failed to load complaint details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString(
      "en-PK",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formatTime = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleTimeString(
      "en-PK",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (status) => {
    if (!status) return "";

    return `status-${status
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  /* =====================================================
     PRIORITY CLASS
  ===================================================== */

  const getPriorityClass = (priority) => {
    if (!priority) return "";

    return `priority-${priority.toLowerCase()}`;
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="complaint-details-page">
        <div className="complaint-details-loading">
          Loading complaint details...
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (errorMessage || !complaint) {
    return (
      <div className="complaint-details-page">
        <div className="complaint-details-error">

          <AlertCircle size={45} />

          <h2>
            {errorMessage ||
              "Complaint not found"}
          </h2>

          <p>
            We could not load the requested
            complaint.
          </p>

          <button
            className="complaint-error-btn"
            onClick={() =>
              navigate(
                "/citizen/complaints"
              )
            }
          >
            Back to Complaints
          </button>

        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="complaint-details-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="complaint-details-header">

        <button
          className="complaint-back-btn"
          onClick={() =>
            navigate(
              "/citizen/complaints"
            )
          }
        >
          <ArrowLeft size={18} />
          Back to Complaints
        </button>

        <div className="complaint-details-title-section">

          <div>
            <h1 className="complaint-details-title">
              Complaint Details
            </h1>

            <p className="complaint-details-id">
              Complaint ID:{" "}
              {complaint.complaintId}
            </p>
          </div>

          <span
            className={`complaint-status ${getStatusClass(
              complaint.status
            )}`}
          >
            {complaint.status}
          </span>

        </div>
      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="complaint-details-card">

        {/* =================================================
            INFORMATION GRID
        ================================================= */}

        <div className="complaint-info-grid">

          {/* SUBJECT */}

          <div className="complaint-info-item">

            <span className="complaint-info-label">
              <FileText size={14} />
              Subject
            </span>

            <span className="complaint-info-value">
              {complaint.subject}
            </span>

          </div>

          {/* CATEGORY */}

          <div className="complaint-info-item">

            <span className="complaint-info-label">
              <Tag size={14} />
              Category
            </span>

            <span className="complaint-info-value">
              {complaint.category}
            </span>

          </div>

          {/* LOCATION */}

          <div className="complaint-info-item">

            <span className="complaint-info-label">
              <MapPin size={14} />
              Location
            </span>

            <span className="complaint-info-value">
              {complaint.location}
            </span>

          </div>

          {/* DEPARTMENT */}

          <div className="complaint-info-item">

            <span className="complaint-info-label">
              <Building2 size={14} />
              Department
            </span>

            <span className="complaint-info-value">
              {complaint.department ||
                "Pending Assignment"}
            </span>

          </div>

          {/* DATE */}

          <div className="complaint-info-item">

            <span className="complaint-info-label">
              <CalendarDays size={14} />
              Submitted Date
            </span>

            <span className="complaint-info-value">
              {formatDate(
                complaint.createdAt
              )}
            </span>

          </div>

          {/* TIME */}

          <div className="complaint-info-item">

            <span className="complaint-info-label">
              <Clock size={14} />
              Submitted Time
            </span>

            <span className="complaint-info-value">
              {formatTime(
                complaint.createdAt
              )}
            </span>

          </div>

          {/* PRIORITY */}

          <div className="complaint-info-item">

            <span className="complaint-info-label">
              <AlertCircle size={14} />
              Priority
            </span>

            <span
              className={`complaint-priority ${getPriorityClass(
                complaint.priority
              )}`}
            >
              {complaint.priority}
            </span>

          </div>

          {/* STATUS */}

          <div className="complaint-info-item">

            <span className="complaint-info-label">
              Status
            </span>

            <span
              className={`complaint-status ${getStatusClass(
                complaint.status
              )}`}
            >
              {complaint.status}
            </span>

          </div>

        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div className="complaint-description-section">

          <h2 className="complaint-section-title">
            Complaint Description
          </h2>

          <p className="complaint-description">
            {complaint.description}
          </p>

        </div>

        {/* =================================================
            OFFICER RESPONSE
        ================================================= */}

        <div className="complaint-response-section">

          <div className="complaint-response-header">

            <div className="complaint-response-icon">
              <MessageSquare size={20} />
            </div>

            <div>
              <h2 className="complaint-section-title">
                Department Response
              </h2>

              <p className="complaint-response-subtitle">
                Response from the assigned
                department officer
              </p>
            </div>

          </div>

          {complaint.departmentResponse ? (

            <div className="complaint-response-box">

              <div className="complaint-response-status">
                <CheckCircle2 size={17} />

                <span>
                  Officer Response
                </span>
              </div>

              <p>
                {complaint.departmentResponse}
              </p>

            </div>

          ) : (

            <div className="complaint-no-response">

              <Clock size={20} />

              <div>
                <strong>
                  No response yet
                </strong>

                <p>
                  The assigned department has
                  not added a response to this
                  complaint yet.
                </p>
              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default ComplaintDetails;