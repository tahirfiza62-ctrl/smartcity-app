import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  FileText,
  MapPin,
  User,
  Calendar,
  AlertCircle,
  Save,
  Building2,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

import "./DepartmentComplaintDetails.css";

const API_URL = "http://localhost:3000";

const DepartmentComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");

  /* =========================================================
     LOAD COMPLAINT
  ========================================================= */

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        setLoading(true);

        const departmentToken =
          localStorage.getItem("department_token");

        console.log("=================================");
        console.log("DEPARTMENT COMPLAINT DETAILS");
        console.log("Complaint ID:", id);
        console.log(
          "Department token exists:",
          !!departmentToken
        );
        console.log("=================================");

        if (!departmentToken) {
          toast.error(
            "Department session expired. Please login again."
          );

          navigate("/department-login");
          return;
        }

        const result = await axios.get(
          `${API_URL}/api/complaints/department/${id}`,
          {
            headers: {
              Authorization: `Bearer ${departmentToken}`,
            },
          }
        );

        console.log(
          "FULL API RESPONSE:",
          result.data
        );

        /* =====================================================
           IMPORTANT

           Backend returns:

           {
             success: true,
             complaint: {...},
             officer: {...}
           }

           Therefore we need result.data.complaint
        ===================================================== */

        const complaintData =
          result.data.complaint;

        console.log(
          "COMPLAINT DATA:",
          complaintData
        );

        if (!complaintData) {
          toast.error(
            "Complaint information was not returned."
          );

          return;
        }

        setComplaint(complaintData);

        setStatus(
          complaintData.status || "Submitted"
        );

        setResponse(
          complaintData.departmentResponse || ""
        );
      } catch (error) {
        console.error(
          "FETCH COMPLAINT ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "MESSAGE:",
          error.response?.data?.message
        );

        if (error.response?.status === 401) {
          localStorage.removeItem(
            "department_token"
          );

          localStorage.removeItem(
            "department_user"
          );

          toast.error(
            "Your department session has expired."
          );

          navigate("/department-login");
          return;
        }

        if (error.response?.status === 403) {
          toast.error(
            error.response?.data?.message ||
              "You do not have access to this complaint."
          );

          navigate("/department/complaints");
          return;
        }

        if (error.response?.status === 404) {
          toast.error(
            "Complaint was not found."
          );

          navigate("/department/complaints");
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Failed to load complaint."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaint();
  }, [id, navigate]);

  /* =========================================================
     UPDATE COMPLAINT
  ========================================================= */

  const handleUpdate = async (event) => {
    event.preventDefault();

    const departmentToken =
      localStorage.getItem("department_token");

    if (!departmentToken) {
      toast.error(
        "Department session expired. Please login again."
      );

      navigate("/department-login");
      return;
    }

    if (!status) {
      toast.error(
        "Please select a complaint status."
      );

      return;
    }

    try {
      setSaving(true);

      console.log(
        "UPDATING COMPLAINT:",
        id
      );

      const result = await axios.patch(
        `${API_URL}/api/complaints/${id}/status`,
        {
          status,
          departmentResponse:
            response.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${departmentToken}`,
          },
        }
      );

      console.log(
        "UPDATE RESPONSE:",
        result.data
      );

      const updatedComplaint =
        result.data?.complaint;

      if (updatedComplaint) {
        setComplaint(updatedComplaint);

        setStatus(
          updatedComplaint.status || status
        );

        setResponse(
          updatedComplaint.departmentResponse ||
            ""
        );
      }

      toast.success(
        result.data?.message ||
          "Complaint updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE COMPLAINT ERROR:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem(
          "department_token"
        );

        localStorage.removeItem(
          "department_user"
        );

        toast.error(
          "Your department session has expired."
        );

        navigate("/department-login");
        return;
      }

      if (error.response?.status === 403) {
        toast.error(
          error.response?.data?.message ||
            "You do not have permission to update this complaint."
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to update complaint."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (value) => {
    if (!value) return "";

    return value
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="department-complaint-loading">
        <div className="loading-spinner"></div>
        <p>Loading complaint...</p>
      </div>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!complaint) {
    return (
      <div className="department-complaint-loading">
        <FileText size={42} />

        <h2>
          Complaint not found
        </h2>

        <button
          onClick={() =>
            navigate("/department/complaints")
          }
        >
          Back to Complaints
        </button>
      </div>
    );
  }

  return (
    <div className="department-complaint-details-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="department-details-header">

        <button
          type="button"
          className="department-back-btn"
          onClick={() =>
            navigate("/department/complaints")
          }
        >
          <ArrowLeft size={18} />

          Back to Complaints
        </button>

        <div className="department-details-title">

          <div className="department-details-icon">
            <FileText size={25} />
          </div>

          <div>
            <span>
              COMPLAINT MANAGEMENT
            </span>

            <h1>
              {complaint.complaintId ||
                "Complaint"}
            </h1>
          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="department-details-grid">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="department-details-main">

          {/* =================================================
              COMPLAINT INFORMATION
          ================================================= */}

          <div className="department-details-card">

            <div className="card-heading">

              <div>

                <span>
                  COMPLAINT INFORMATION
                </span>

                <h2>
                  {complaint.subject ||
                    "Untitled Complaint"}
                </h2>

              </div>

              <span
                className={`complaint-status-badge ${getStatusClass(
                  complaint.status
                )}`}
              >
                {complaint.status ||
                  "Submitted"}
              </span>

            </div>

            {/* =================================================
                INFORMATION GRID
            ================================================= */}

            <div className="complaint-info-grid">

              {/* =================================================
                  CITIZEN NAME
              ================================================= */}

              <div className="complaint-info-item">

                <div className="info-icon">
                  <User size={18} />
                </div>

                <div>
                  <span>
                    Citizen
                  </span>

                  <strong>
                    {complaint.citizenName ||
                      complaint.user?.fullName ||
                      "Unknown"}
                  </strong>
                </div>

              </div>

              {/* =================================================
                  CITIZEN EMAIL
              ================================================= */}

              <div className="complaint-info-item">

                <div className="info-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <span>
                    Citizen Email
                  </span>

                  <strong>
                    {complaint.citizenEmail ||
                      complaint.user?.email ||
                      "No email available"}
                  </strong>
                </div>

              </div>

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <div className="complaint-info-item">

                <div className="info-icon">
                  <FileText size={18} />
                </div>

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {complaint.category ||
                      "—"}
                  </strong>
                </div>

              </div>

              {/* =================================================
                  DEPARTMENT
              ================================================= */}

              <div className="complaint-info-item">

                <div className="info-icon">
                  <Building2 size={18} />
                </div>

                <div>
                  <span>
                    Assigned Department
                  </span>

                  <strong>
                    {complaint.department ||
                      "—"}
                  </strong>
                </div>

              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}

              <div className="complaint-info-item">

                <div className="info-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>
                    Location
                  </span>

                  <strong>
                    {complaint.location ||
                      "No location provided"}
                  </strong>
                </div>

              </div>

              {/* =================================================
                  PRIORITY
              ================================================= */}

              <div className="complaint-info-item">

                <div className="info-icon">
                  <AlertCircle size={18} />
                </div>

                <div>
                  <span>
                    Priority
                  </span>

                  <strong>
                    {complaint.priority ||
                      "Medium"}
                  </strong>
                </div>

              </div>

              {/* =================================================
                  SUBMITTED DATE
              ================================================= */}

              <div className="complaint-info-item">

                <div className="info-icon">
                  <Calendar size={18} />
                </div>

                <div>
                  <span>
                    Submitted
                  </span>

                  <strong>
                    {complaint.createdAt
                      ? new Date(
                          complaint.createdAt
                        ).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </strong>
                </div>

              </div>

              {/* =================================================
                  COMPLAINT ID
              ================================================= */}

              <div className="complaint-info-item">

                <div className="info-icon">
                  <FileText size={18} />
                </div>

                <div>
                  <span>
                    Complaint ID
                  </span>

                  <strong>
                    {complaint.complaintId ||
                      "—"}
                  </strong>
                </div>

              </div>

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="complaint-description">

              <span>
                Complaint Description
              </span>

              <p>
                {complaint.description ||
                  "No description provided."}
              </p>

            </div>

          </div>

          {/* =================================================
              DEPARTMENT UPDATE
          ================================================= */}

          <form
            className="department-update-card"
            onSubmit={handleUpdate}
          >

            <div className="update-card-heading">

              <div>

                <span>
                  DEPARTMENT ACTION
                </span>

                <h2>
                  Update Complaint
                </h2>

              </div>

              <div className="update-icon">
                <Save size={20} />
              </div>

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="update-form-group">

              <label>
                Complaint Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
              >

                <option value="Submitted">
                  Submitted
                </option>

                <option value="Pending">
                  Pending
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

                <option value="Closed">
                  Closed
                </option>

              </select>

            </div>

            {/* =================================================
                RESPONSE
            ================================================= */}

            <div className="update-form-group">

              <label>
                Response to Citizen
              </label>

              <textarea
                rows="5"
                placeholder="Write an update or response for the citizen..."
                value={response}
                onChange={(event) =>
                  setResponse(
                    event.target.value
                  )
                }
              />

            </div>

            {/* =================================================
                UPDATE FOOTER
            ================================================= */}

            <div className="update-form-footer">

              <p>
                The citizen will see the updated
                status and response in their portal.
              </p>

              <button
                type="submit"
                disabled={saving}
              >

                <Save size={17} />

                {saving
                  ? "Updating..."
                  : "Update Complaint"}

              </button>

            </div>

          </form>

        </div>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="department-details-sidebar">

          {/* =================================================
              CURRENT STATUS
          ================================================= */}

          <div className="current-status-card">

            <span>
              CURRENT STATUS
            </span>

            <div
              className={`large-status ${getStatusClass(
                complaint.status
              )}`}
            >
              {complaint.status ||
                "Submitted"}
            </div>

            <p>
              Status changes made by your
              department are visible to the
              citizen.
            </p>

          </div>

          {/* =================================================
              DEPARTMENT
          ================================================= */}

          <div className="department-response-card">

            <span>
              ASSIGNED DEPARTMENT
            </span>

            <div className="side-info">

              <Building2 size={19} />

              <strong>
                {complaint.department ||
                  "Not assigned"}
              </strong>

            </div>

          </div>

          {/* =================================================
              CITIZEN
          ================================================= */}

          <div className="department-response-card">

            <span>
              SUBMITTED BY
            </span>

            <div className="side-citizen">

              <div className="side-avatar">
                <User size={18} />
              </div>

              <div>
                <strong>
                  {complaint.citizenName ||
                    "Unknown Citizen"}
                </strong>

                <p>
                  {complaint.citizenEmail ||
                    "No email available"}
                </p>
              </div>

            </div>

          </div>

          {/* =================================================
              LOCATION
          ================================================= */}

          <div className="department-response-card">

            <span>
              COMPLAINT LOCATION
            </span>

            <div className="side-info">

              <MapPin size={19} />

              <strong>
                {complaint.location ||
                  "No location provided"}
              </strong>

            </div>

          </div>

          {/* =================================================
              CURRENT RESPONSE
          ================================================= */}

          <div className="department-response-card">

            <span>
              CURRENT DEPARTMENT RESPONSE
            </span>

            <p>
              {complaint.departmentResponse ||
                "No response has been added yet."}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DepartmentComplaintDetails;