import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Search,
  Pencil,
  X,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Activity,
  User,
  Mail,
  FileText,
} from "lucide-react";

import "./Emergencies.css";

const API_URL = "http://localhost:3000";

const emptyForm = {
  severity: "Medium",
  status: "Reported",
  responseTeam: "",
  responseNotes: "",
};

const DepartmentEmergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] =
    useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // DEPARTMENT PORTAL TOKEN
  // =====================================================

  const token = localStorage.getItem("department_token");

  // =====================================================
  // FETCH EMERGENCIES
  // =====================================================

  const fetchEmergencies = async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      const response = await axios.get(
        `${API_URL}/api/emergencies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmergencies(response.data || []);
    } catch (error) {
      console.error(
        "FETCH EMERGENCIES ERROR:",
        error
      );

      if (error.response) {
        console.error(
          "Backend response:",
          error.response.data
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  // =====================================================
  // OPEN UPDATE MODAL
  // =====================================================

  const openEditModal = (emergency) => {
    setSelectedEmergency(emergency);

    setForm({
      severity: emergency.severity || "Medium",
      status: emergency.status || "Reported",
      responseTeam:
        emergency.responseTeam || "",
      responseNotes:
        emergency.responseNotes || "",
    });

    setModalOpen(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEmergency(null);
    setForm(emptyForm);
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // UPDATE EMERGENCY
  // =====================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!selectedEmergency) return;

    try {
      setSaving(true);

      const response = await axios.patch(
        `${API_URL}/api/emergencies/${selectedEmergency._id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmergencies((previous) =>
        previous.map((item) =>
          item._id === selectedEmergency._id
            ? response.data
            : item
        )
      );

      closeModal();
    } catch (error) {
      console.error(
        "UPDATE EMERGENCY ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update emergency"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredEmergencies = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return emergencies.filter((emergency) => {
      const matchesSearch =
        !searchValue ||
        emergency.emergencyId
          ?.toLowerCase()
          .includes(searchValue) ||
        emergency.title
          ?.toLowerCase()
          .includes(searchValue) ||
        emergency.type
          ?.toLowerCase()
          .includes(searchValue) ||
        emergency.location
          ?.toLowerCase()
          .includes(searchValue) ||
        emergency.citizenName
          ?.toLowerCase()
          .includes(searchValue) ||
        emergency.citizenEmail
          ?.toLowerCase()
          .includes(searchValue);

      const matchesSeverity =
        severityFilter === "All" ||
        emergency.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" ||
        emergency.status === statusFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    });
  }, [
    emergencies,
    search,
    severityFilter,
    statusFilter,
  ]);

  // =====================================================
  // STATS
  // =====================================================

  const total = emergencies.length;

  const active = emergencies.filter(
    (item) =>
      item.status === "Assigned" ||
      item.status === "In Progress"
  ).length;

  const critical = emergencies.filter(
    (item) =>
      item.severity === "Critical"
  ).length;

  const resolved = emergencies.filter(
    (item) =>
      item.status === "Resolved"
  ).length;

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (!status) return "";

    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =====================================================
  // SEVERITY CLASS
  // =====================================================

  const getSeverityClass = (severity) => {
    if (!severity) return "";

    return severity.toLowerCase();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="emergency-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="emergency-page-header">

        <div>
          <div className="emergency-eyebrow">
            DEPARTMENT OPERATIONS
          </div>

          <h1>
            Emergency Management
          </h1>

          <p>
            Monitor citizen-reported emergencies
            and coordinate department response
            activities.
          </p>
        </div>

        <div className="department-emergency-info">
          <AlertTriangle size={18} />

          <span>
            Citizen-reported emergencies are
            shown here automatically.
          </span>
        </div>

      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="emergency-stats">

        <div className="emergency-stat-card">

          <div className="emergency-stat-icon">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>
              Total Emergencies
            </span>

            <strong>
              {total}
            </strong>
          </div>

        </div>

        <div className="emergency-stat-card">

          <div className="emergency-stat-icon active-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>
              Active Response
            </span>

            <strong>
              {active}
            </strong>
          </div>

        </div>

        <div className="emergency-stat-card">

          <div className="emergency-stat-icon critical-icon">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>
              Critical
            </span>

            <strong>
              {critical}
            </strong>
          </div>

        </div>

        <div className="emergency-stat-card">

          <div className="emergency-stat-icon resolved-icon">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>
              Resolved
            </span>

            <strong>
              {resolved}
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="emergency-toolbar">

        <div className="emergency-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search emergency, ID, citizen or location..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <select
          value={severityFilter}
          onChange={(event) =>
            setSeverityFilter(
              event.target.value
            )
          }
        >
          <option value="All">
            All Severity
          </option>

          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>

          <option value="Critical">
            Critical
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Reported">
            Reported
          </option>

          <option value="Assigned">
            Assigned
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Resolved">
            Resolved
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>

      </div>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="emergency-table-card">

        <div className="emergency-table-header">

          <div>
            <h2>
              Emergency Reports
            </h2>

            <p>
              {filteredEmergencies.length}{" "}
              {filteredEmergencies.length === 1
                ? "emergency"
                : "emergencies"}
            </p>
          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="emergency-empty">

            <div className="emergency-loader"></div>

            <p>
              Loading emergencies...
            </p>

          </div>

        ) : filteredEmergencies.length === 0 ? (

          /* EMPTY */

          <div className="emergency-empty">

            <AlertTriangle size={40} />

            <h3>
              No emergencies found
            </h3>

            <p>
              No citizen emergency reports
              match your current filters.
            </p>

          </div>

        ) : (

          /* TABLE */

          <div className="emergency-table-wrapper">

            <table className="emergency-table">

              <thead>

                <tr>
                  <th>Emergency</th>
                  <th>Citizen</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Response Team</th>
                  <th>Reported</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {filteredEmergencies.map(
                  (emergency) => (

                    <tr
                      key={emergency._id}
                    >

                      {/* EMERGENCY */}

                      <td>

                        <div className="emergency-id">
                          {emergency.emergencyId}
                        </div>

                        <div className="emergency-title">
                          {emergency.title}
                        </div>

                      </td>

                      {/* CITIZEN */}

                      <td>

                        <div className="citizen-info">

                          <div className="citizen-name">
                            <User size={14} />

                            {emergency.citizenName ||
                              emergency.citizen?.fullName ||
                              "Unknown"}
                          </div>

                          <div className="citizen-email">
                            <Mail size={13} />

                            {emergency.citizenEmail ||
                              emergency.citizen?.email ||
                              "—"}
                          </div>

                        </div>

                      </td>

                      {/* TYPE */}

                      <td>

                        <span className="emergency-type">
                          {emergency.type}
                        </span>

                      </td>

                      {/* LOCATION */}

                      <td>

                        <div className="emergency-location">

                          <MapPin size={15} />

                          <span>
                            {emergency.location}
                          </span>

                        </div>

                      </td>

                      {/* SEVERITY */}

                      <td>

                        <span
                          className={`severity-badge ${getSeverityClass(
                            emergency.severity
                          )}`}
                        >
                          {emergency.severity}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`emergency-status ${getStatusClass(
                            emergency.status
                          )}`}
                        >
                          {emergency.status}
                        </span>

                      </td>

                      {/* RESPONSE TEAM */}

                      <td>

                        <div className="response-team">

                          <Users size={15} />

                          <span>
                            {emergency.responseTeam ||
                              "Not assigned"}
                          </span>

                        </div>

                      </td>

                      {/* DATE */}

                      <td>

                        <div className="reported-date">

                          <Clock size={14} />

                          <div>

                            <span>
                              {formatDate(
                                emergency.reportedAt
                              )}
                            </span>

                            <small>
                              {formatTime(
                                emergency.reportedAt
                              )}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* ACTION */}

                      <td>

                        <button
                          className="edit-btn"
                          onClick={() =>
                            openEditModal(
                              emergency
                            )
                          }
                          title="Manage Emergency"
                        >
                          <Pencil size={16} />
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

      {/* =====================================================
          UPDATE MODAL
      ===================================================== */}

      {modalOpen &&
        selectedEmergency && (

          <div
            className="emergency-modal-overlay"
            onClick={closeModal}
          >

            <div
              className="emergency-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="emergency-modal-header">

                <div className="modal-heading">

                  <div className="modal-icon">
                    <AlertTriangle size={21} />
                  </div>

                  <div>
                    <h2>
                      Manage Emergency
                    </h2>

                    <p>
                      {
                        selectedEmergency.emergencyId
                      }
                    </p>
                  </div>

                </div>

                <button
                  className="modal-close"
                  onClick={closeModal}
                >
                  <X size={20} />
                </button>

              </div>

              {/* CITIZEN DETAILS */}

              <div className="emergency-citizen-details">

                <div className="detail-item">

                  <User size={17} />

                  <div>
                    <span>
                      Citizen
                    </span>

                    <strong>
                      {
                        selectedEmergency.citizenName ||
                        selectedEmergency.citizen?.fullName ||
                        "Unknown"
                      }
                    </strong>
                  </div>

                </div>

                <div className="detail-item">

                  <Mail size={17} />

                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      {
                        selectedEmergency.citizenEmail ||
                        selectedEmergency.citizen?.email ||
                        "—"
                      }
                    </strong>
                  </div>

                </div>

                <div className="detail-item">

                  <MapPin size={17} />

                  <div>
                    <span>
                      Location
                    </span>

                    <strong>
                      {
                        selectedEmergency.location
                      }
                    </strong>
                  </div>

                </div>

                <div className="detail-item">

                  <FileText size={17} />

                  <div>
                    <span>
                      Emergency Type
                    </span>

                    <strong>
                      {
                        selectedEmergency.type
                      }
                    </strong>
                  </div>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="emergency-description-box">

                <span>
                  Description
                </span>

                <p>
                  {
                    selectedEmergency.description ||
                    "No description provided."
                  }
                </p>

              </div>

              {/* UPDATE FORM */}

              <form
                className="emergency-form"
                onSubmit={handleUpdate}
              >

                <div className="form-grid">

                  {/* SEVERITY */}

                  <div className="form-group">

                    <label>
                      Severity
                    </label>

                    <select
                      name="severity"
                      value={form.severity}
                      onChange={handleChange}
                    >

                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>

                      <option value="Critical">
                        Critical
                      </option>

                    </select>

                  </div>

                  {/* STATUS */}

                  <div className="form-group">

                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >

                      <option value="Reported">
                        Reported
                      </option>

                      <option value="Assigned">
                        Assigned
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Resolved">
                        Resolved
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>

                    </select>

                  </div>

                  {/* RESPONSE TEAM */}

                  <div className="form-group full-width">

                    <label>
                      Response Team
                    </label>

                    <input
                      type="text"
                      name="responseTeam"
                      placeholder="Enter response team"
                      value={form.responseTeam}
                      onChange={handleChange}
                    />

                  </div>

                  {/* RESPONSE NOTES */}

                  <div className="form-group full-width">

                    <label>
                      Response Notes
                    </label>

                    <textarea
                      name="responseNotes"
                      rows="4"
                      placeholder="Add response or coordination notes..."
                      value={form.responseNotes}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                {/* FOOTER */}

                <div className="emergency-form-footer">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-emergency-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Updating..."
                      : "Update Emergency"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
};

export default DepartmentEmergencies;