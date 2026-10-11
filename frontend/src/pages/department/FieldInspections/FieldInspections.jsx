import { useEffect, useState } from "react";
import axios from "axios";
import {
  ClipboardCheck,
  Plus,
  X,
  Search,
  MapPin,
  CalendarDays,
  User,
  FileText,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import "./FieldInspections.css";

const API_URL = "http://localhost:3000";

const FieldInspections = () => {
  const [inspections, setInspections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [form, setForm] = useState({
    complaintId: "",
    location: "",
    inspectionDate: "",
    findings: "",
    status: "Scheduled",
    notes: "",
  });

  // =====================================================
  // DEPARTMENT PORTAL TOKEN
  // =====================================================

  const token =
    localStorage.getItem(
      "department_token"
    );

  // =====================================================
  // FETCH INSPECTIONS
  // =====================================================

  const fetchInspections = async () => {
    try {
      setLoading(true);

      if (!token) {
        toast.error(
          "Authentication token not found."
        );

        window.location.href =
          "/department-login";

        return;
      }

      const response = await axios.get(
        `${API_URL}/api/inspections`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setInspections(
        response.data.inspections || []
      );
    } catch (error) {
      console.error(
        "Fetch inspections error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        toast.error(
          "You are not authorized to view inspections."
        );
      } else {
        toast.error(
          "Failed to load inspections."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href =
        "/department-login";
      return;
    }

    fetchInspections();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.complaintId ||
      !form.location ||
      !form.inspectionDate ||
      !form.findings
    ) {
      toast.error(
        "Please fill all required fields."
      );

      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/inspections`,
        form,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Inspection created successfully."
      );

      setForm({
        complaintId: "",
        location: "",
        inspectionDate: "",
        findings: "",
        status: "Scheduled",
        notes: "",
      });

      setShowForm(false);

      fetchInspections();
    } catch (error) {
      console.error(
        "Create inspection error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create inspection."
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this inspection?"
      );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/api/inspections/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Inspection deleted."
      );

      fetchInspections();
    } catch (error) {
      console.error(
        "Delete inspection error:",
        error
      );

      toast.error(
        "Failed to delete inspection."
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredInspections =
    inspections.filter(
      (inspection) => {
        const query =
          search.toLowerCase();

        return (
          inspection.inspectionId
            ?.toLowerCase()
            .includes(query) ||
          inspection.complaintId
            ?.toLowerCase()
            .includes(query) ||
          inspection.location
            ?.toLowerCase()
            .includes(query) ||
          inspection.status
            ?.toLowerCase()
            .includes(query)
        );
      }
    );

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="field-inspections-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="inspection-page-header">

        <div className="inspection-header-left">

          <div className="inspection-header-icon">
            <ClipboardCheck size={30} />
          </div>

          <div>

            <span className="inspection-eyebrow">
              DEPARTMENT OPERATIONS
            </span>

            <h1>
              Field Inspections
            </h1>

            <p>
              Schedule, manage and track
              field inspections for
              department complaints.
            </p>

          </div>

        </div>

        <button
          className="add-inspection-btn"
          onClick={() =>
            setShowForm(true)
          }
        >
          <Plus size={18} />
          New Inspection
        </button>

      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="inspection-stats">

        <div className="inspection-stat-card">

          <div className="stat-icon">
            <ClipboardCheck size={21} />
          </div>

          <div>

            <span>
              Total Inspections
            </span>

            <strong>
              {inspections.length}
            </strong>

          </div>

        </div>

        <div className="inspection-stat-card">

          <div className="stat-icon scheduled">
            <CalendarDays size={21} />
          </div>

          <div>

            <span>
              Scheduled
            </span>

            <strong>
              {
                inspections.filter(
                  (item) =>
                    item.status ===
                    "Scheduled"
                ).length
              }
            </strong>

          </div>

        </div>

        <div className="inspection-stat-card">

          <div className="stat-icon progress">
            <ClipboardCheck size={21} />
          </div>

          <div>

            <span>
              In Progress
            </span>

            <strong>
              {
                inspections.filter(
                  (item) =>
                    item.status ===
                    "In Progress"
                ).length
              }
            </strong>

          </div>

        </div>

        <div className="inspection-stat-card">

          <div className="stat-icon completed">
            <FileText size={21} />
          </div>

          <div>

            <span>
              Completed
            </span>

            <strong>
              {
                inspections.filter(
                  (item) =>
                    item.status ===
                    "Completed"
                ).length
              }
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          TABLE CARD
      ================================================= */}

      <div className="inspection-table-card">

        <div className="inspection-table-top">

          <div>

            <h2>
              Inspection Records
            </h2>

            <p>
              All inspections assigned
              to your department.
            </p>

          </div>

          <div className="inspection-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search inspections..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {loading ? (

          <div className="inspection-loading">
            Loading inspections...
          </div>

        ) : filteredInspections.length ===
          0 ? (

          <div className="inspection-empty">

            <ClipboardCheck
              size={42}
            />

            <h3>
              No inspections found
            </h3>

            <p>
              Create an inspection to
              start tracking field work.
            </p>

          </div>

        ) : (

          <div className="inspection-table-wrapper">

            <table className="inspection-table">

              <thead>

                <tr>

                  <th>
                    Inspection ID
                  </th>

                  <th>
                    Complaint
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Officer
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInspections.map(
                  (inspection) => (

                    <tr
                      key={
                        inspection._id
                      }
                    >

                      <td>
                        <strong>
                          {
                            inspection.inspectionId
                          }
                        </strong>
                      </td>

                      <td>

                        <span className="complaint-id">
                          {
                            inspection.complaintId
                          }
                        </span>

                      </td>

                      <td>

                        <div className="location-cell">

                          <MapPin
                            size={15}
                          />

                          {
                            inspection.location
                          }

                        </div>

                      </td>

                      <td>
                        {formatDate(
                          inspection.inspectionDate
                        )}
                      </td>

                      <td>

                        <span
                          className={`inspection-status ${
                            inspection.status
                              ?.toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              ) || ""
                          }`}
                        >
                          {
                            inspection.status
                          }
                        </span>

                      </td>

                      <td>

                        <div className="officer-cell">

                          <User
                            size={15}
                          />

                          {
                            inspection.officerName ||
                            "Not assigned"
                          }

                        </div>

                      </td>

                      <td>

                        <button
                          className="delete-inspection-btn"
                          onClick={() =>
                            handleDelete(
                              inspection._id
                            )
                          }
                          title="Delete inspection"
                        >

                          <Trash2
                            size={17}
                          />

                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {showForm && (

        <div
          className="inspection-modal-overlay"
          onClick={() =>
            setShowForm(false)
          }
        >

          <div
            className="inspection-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="inspection-modal-header">

              <div>

                <span>
                  DEPARTMENT OPERATIONS
                </span>

                <h2>
                  New Field Inspection
                </h2>

              </div>

              <button
                className="inspection-close-btn"
                onClick={() =>
                  setShowForm(false)
                }
              >
                <X size={21} />
              </button>

            </div>

            <form
              className="inspection-form"
              onSubmit={handleSubmit}
            >

              <div className="inspection-form-group">

                <label>
                  Complaint ID *
                </label>

                <input
                  type="text"
                  name="complaintId"
                  placeholder="e.g. CMP-2026-0001"
                  value={
                    form.complaintId
                  }
                  onChange={
                    handleChange
                  }
                />

                <small>
                  Enter a complaint assigned
                  to your department.
                </small>

              </div>

              <div className="inspection-form-row">

                <div className="inspection-form-group">

                  <label>
                    Location *
                  </label>

                  <input
                    type="text"
                    name="location"
                    placeholder="Inspection location"
                    value={
                      form.location
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                <div className="inspection-form-group">

                  <label>
                    Inspection Date *
                  </label>

                  <input
                    type="date"
                    name="inspectionDate"
                    value={
                      form.inspectionDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

              <div className="inspection-form-row">

                <div className="inspection-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Scheduled">
                      Scheduled
                    </option>

                    <option value="In Progress">
                      In Progress
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

              <div className="inspection-form-group">

                <label>
                  Findings *
                </label>

                <textarea
                  name="findings"
                  rows="5"
                  placeholder="Enter the findings from the field inspection..."
                  value={
                    form.findings
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="inspection-form-group">

                <label>
                  Additional Notes
                </label>

                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Add any additional notes..."
                  value={
                    form.notes
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              <div className="inspection-form-actions">

                <button
                  type="button"
                  className="cancel-inspection-btn"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-inspection-btn"
                >

                  <ClipboardCheck
                    size={18}
                  />

                  Create Inspection

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default FieldInspections;