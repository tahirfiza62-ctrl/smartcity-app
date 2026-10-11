
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  UserRound,
  FileText,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  KeyRound,
} from "lucide-react";
import "./Departments.css";

const API_URL = "http://localhost:3000/api/admin/departments";

const EMPTY_FORM = {
  name: "",
  description: "",
  headName: "",
  email: "",
  phone: "",
  location: "",
  status: "active",
};

const EMPTY_STAFF_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

/* =========================================================
   AUTHENTICATION
========================================================= */

const getAdminToken = () =>
  localStorage.getItem("smartcity_admin_token") ||
  localStorage.getItem("adminToken") ||
  localStorage.getItem("admin_token") ||
  localStorage.getItem("token");

/* =========================================================
   ERROR MESSAGE HELPER
========================================================= */

const getFetchErrorMessage = (error) => {
  if (error.response?.status === 401) {
    return "Your admin session expired. Please log in again.";
  }

  if (error.response?.status === 403) {
    return (
      error.response?.data?.message ||
      "Admin access denied. Check your admin account."
    );
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "Failed to load departments."
  );
};

/* =========================================================
   DEPARTMENTS COMPONENT
========================================================= */

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Department staff login state.
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    ...EMPTY_STAFF_FORM,
  });

  /* =======================================================
     FETCH DEPARTMENTS

     This function only fetches and returns data.
     It does not update component state.
  ======================================================= */

  const fetchDepartments = useCallback(async (signal) => {
    try {
      const token = getAdminToken();

      if (!token) {
        return {
          departments: null,
          error: "Admin session not found. Please log in again.",
          status: 401,
        };
      }

      const response = await axios.get(API_URL, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.departments)
          ? data.departments
          : Array.isArray(data?.data)
            ? data.data
            : null;

      if (data?.success === false || list === null) {
        throw new Error(
          data?.message ||
            "The departments API returned an unexpected response."
        );
      }

      return {
        departments: list,
        error: "",
        status: 200,
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
        "FETCH DEPARTMENTS ERROR:",
        error.response?.data || error
      );

      return {
        departments: null,
        error: getFetchErrorMessage(error),
        status: error.response?.status || 0,
      };
    }
  }, []);

  /* =======================================================
     INITIAL LOAD

     State is updated only after the request completes.
     AbortController cancels outdated requests on cleanup.
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const loadDepartments = async () => {
      const result = await fetchDepartments(controller.signal);

      if (!result || controller.signal.aborted) {
        return;
      }

      if (result.error) {
        setDepartments([]);
        toast.error(result.error);
      } else {
        setDepartments(result.departments);
      }

      setLoading(false);
    };

    loadDepartments();

    return () => {
      controller.abort();
    };
  }, [fetchDepartments]);

  /* =======================================================
     REFRESH DEPARTMENTS
  ======================================================= */

  const handleRefresh = async () => {
    setLoading(true);

    try {
      const result = await fetchDepartments();

      if (!result) {
        return;
      }

      if (result.error) {
        setDepartments([]);
        toast.error(result.error);
      } else {
        setDepartments(result.departments);
        toast.success("Departments refreshed successfully.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     ADD / EDIT DEPARTMENT
  ======================================================= */

  const openAddModal = () => {
    setEditingDepartment(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);

    setForm({
      name: department.name || "",
      description: department.description || "",
      headName: department.headName || "",
      email: department.email || "",
      phone: department.phone || "",
      location: department.location || "",
      status:
        String(department.status || "active").toLowerCase() ===
        "inactive"
          ? "inactive"
          : "active",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingDepartment(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Please enter a department name.");
      return false;
    }

    if (!form.description.trim()) {
      toast.error("Please enter a department description.");
      return false;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (
      form.phone.trim() &&
      !/^[0-9+\-()\s]{7,20}$/.test(form.phone.trim())
    ) {
      toast.error("Please enter a valid phone number.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const token = getAdminToken();

    if (!token) {
      toast.error("Admin session not found. Please log in again.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      headName: form.headName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      status: form.status,
    };

    try {
      setSaving(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingDepartment?._id) {
        await axios.put(
          `${API_URL}/${editingDepartment._id}`,
          payload,
          config
        );

        toast.success("Department updated successfully.");
      } else {
        await axios.post(API_URL, payload, config);

        toast.success("Department added successfully.");
      }

      setModalOpen(false);
      setEditingDepartment(null);
      setForm({ ...EMPTY_FORM });

      setLoading(true);

      const result = await fetchDepartments();

      if (result) {
        if (result.error) {
          toast.error(result.error);
        } else {
          setDepartments(result.departments);
        }
      }
    } catch (error) {
      console.error(
        "SAVE DEPARTMENT ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to save department."
      );
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE DEPARTMENT
  ======================================================= */

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${department.name}"?`
    );

    if (!confirmed) return;

    const token = getAdminToken();

    if (!token) {
      toast.error("Admin session not found. Please log in again.");
      return;
    }

    try {
      setDeletingId(department._id);

      await axios.delete(`${API_URL}/${department._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDepartments((previous) =>
        previous.filter((item) => item._id !== department._id)
      );

      toast.success("Department deleted successfully.");
    } catch (error) {
      console.error(
        "DELETE DEPARTMENT ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete department."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     CREATE DEPARTMENT STAFF LOGIN
  ======================================================= */

  const openStaffModal = (department) => {
    if (
      String(department.status || "active").toLowerCase() !== "active"
    ) {
      toast.error("Activate this department before adding staff.");
      return;
    }

    setSelectedDepartment(department);

    setStaffForm({
      ...EMPTY_STAFF_FORM,
      fullName: department.headName || "",
    });

    setStaffModalOpen(true);
  };

  const closeStaffModal = () => {
    if (creatingStaff) return;

    setStaffModalOpen(false);
    setSelectedDepartment(null);
    setStaffForm({ ...EMPTY_STAFF_FORM });
  };

  const handleStaffChange = (event) => {
    const { name, value } = event.target;

    setStaffForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateStaff = async (event) => {
    event.preventDefault();

    if (!selectedDepartment?._id) {
      toast.error("Please select a department.");
      return;
    }

    if (!staffForm.fullName.trim()) {
      toast.error("Please enter the staff member's name.");
      return;
    }

    const email = staffForm.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid login email.");
      return;
    }

    if (staffForm.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (staffForm.password !== staffForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const token = getAdminToken();

    if (!token) {
      toast.error("Admin session not found. Please log in again.");
      return;
    }

    try {
      setCreatingStaff(true);

      const response = await axios.post(
        `${API_URL}/${selectedDepartment._id}/account`,
        {
          fullName: staffForm.fullName.trim(),
          email,
          password: staffForm.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message ||
            "Unable to create department login account."
        );
      }

      toast.success(
        response.data?.message ||
          "Department login account created successfully."
      );

      setStaffModalOpen(false);
      setSelectedDepartment(null);
      setStaffForm({ ...EMPTY_STAFF_FORM });
    } catch (error) {
      console.error(
        "CREATE DEPARTMENT STAFF ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to create department login."
      );
    } finally {
      setCreatingStaff(false);
    }
  };

  /* =======================================================
     SEARCH AND STATISTICS
  ======================================================= */

  const query = searchTerm.trim().toLowerCase();

  const filteredDepartments = departments.filter((department) => {
    if (!query) return true;

    return [
      department.name,
      department.description,
      department.headName,
      department.email,
      department.phone,
      department.location,
      department.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  const activeCount = departments.filter(
    (department) =>
      String(department.status || "active").toLowerCase() === "active"
  ).length;

  const inactiveCount = departments.length - activeCount;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="departments-page">
      {/* PAGE HEADING */}

      <section className="departments-heading">
        <div className="departments-heading-content">
          <div className="departments-heading-icon">
            <Building2 size={25} />
          </div>

          <div>
            <span className="departments-eyebrow">
              CIVIC CONNECT · ADMINISTRATION
            </span>

            <h1>Departments Management</h1>

            <p>
              Manage city departments, staff login accounts, contact
              details, and department information.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="departments-primary-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Department
        </button>
      </section>

      {/* STATISTICS */}

      <section className="departments-stat-grid">
        <article className="departments-stat-card">
          <div className="departments-stat-icon stat-blue">
            <Building2 size={21} />
          </div>

          <div>
            <span>Total Departments</span>
            <strong>{departments.length}</strong>
          </div>
        </article>

        <article className="departments-stat-card">
          <div className="departments-stat-icon stat-green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Active Departments</span>
            <strong>{activeCount}</strong>
          </div>
        </article>

        <article className="departments-stat-card">
          <div className="departments-stat-icon stat-red">
            <AlertCircle size={21} />
          </div>

          <div>
            <span>Inactive Departments</span>
            <strong>{inactiveCount}</strong>
          </div>
        </article>
      </section>

      {/* DEPARTMENT LIST */}

      <section className="departments-content-card">
        <div className="departments-toolbar">
          <div>
            <h2>All Departments</h2>

            <p>
              {filteredDepartments.length} department
              {filteredDepartments.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="departments-toolbar-actions">
            <label className="departments-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="departments-refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh departments"
              title="Refresh departments"
            >
              <RefreshCw
                size={17}
                className={loading ? "departments-spin" : ""}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="departments-state">
            <RefreshCw size={30} className="departments-spin" />

            <h3>Loading departments...</h3>

            <p>Fetching department records from the server.</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="departments-state">
            <div className="departments-empty-icon">
              <Building2 size={29} />
            </div>

            <h3>
              {departments.length === 0
                ? "No Departments Found"
                : "No Matching Departments"}
            </h3>

            <p>
              {departments.length === 0
                ? "No department records were returned by the API."
                : "Try another search term."}
            </p>

            {departments.length === 0 && (
              <button
                type="button"
                className="departments-primary-btn"
                onClick={openAddModal}
              >
                <Plus size={17} />
                Add First Department
              </button>
            )}
          </div>
        ) : (
          <div className="departments-grid">
            {filteredDepartments.map((department) => {
              const isActive =
                String(department.status || "active").toLowerCase() ===
                "active";

              return (
                <article
                  className="department-card"
                  key={department._id}
                >
                  <div className="department-card-top">
                    <div className="department-card-icon">
                      <Building2 size={22} />
                    </div>

                    <span
                      className={`department-status ${
                        isActive
                          ? "department-status-active"
                          : "department-status-inactive"
                      }`}
                    >
                      <span />
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3>
                    {department.name || "Unnamed Department"}
                  </h3>

                  <p className="department-description">
                    {department.description ||
                      "No description provided."}
                  </p>

                  <div className="department-details">
                    {department.headName && (
                      <div>
                        <UserRound size={15} />
                        <span>{department.headName}</span>
                      </div>
                    )}

                    {department.email && (
                      <div>
                        <Mail size={15} />
                        <span>{department.email}</span>
                      </div>
                    )}

                    {department.phone && (
                      <div>
                        <Phone size={15} />
                        <span>{department.phone}</span>
                      </div>
                    )}

                    {department.location && (
                      <div>
                        <MapPin size={15} />
                        <span>{department.location}</span>
                      </div>
                    )}

                    {!department.headName &&
                      !department.email &&
                      !department.phone &&
                      !department.location && (
                        <div>
                          <FileText size={15} />
                          <span>No additional contact details</span>
                        </div>
                      )}
                  </div>

                  <div className="department-card-footer">
                    <span className="department-card-label">
                      <Building2 size={14} />
                      City Department
                    </span>

                    <div className="department-card-actions">
                      {/* CREATE STAFF LOGIN */}

                      <button
                        type="button"
                        className="department-action-staff"
                        onClick={() => openStaffModal(department)}
                        disabled={!isActive}
                        title={
                          isActive
                            ? "Create department login"
                            : "Activate this department first"
                        }
                        aria-label={`Add staff to ${department.name}`}
                      >
                        <UserPlus size={15} />
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        className="department-action-edit"
                        onClick={() => openEditModal(department)}
                        title="Edit department"
                        aria-label={`Edit ${department.name}`}
                      >
                        <Pencil size={15} />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        className="department-action-delete"
                        onClick={() => handleDelete(department)}
                        disabled={deletingId === department._id}
                        title="Delete department"
                        aria-label={`Delete ${department.name}`}
                      >
                        {deletingId === department._id ? (
                          <RefreshCw
                            size={15}
                            className="departments-spin"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ADD / EDIT DEPARTMENT MODAL */}

      {modalOpen && (
        <div
          className="department-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            className="department-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-modal-title"
          >
            <div className="department-modal-header">
              <div>
                <span className="departments-eyebrow">
                  DEPARTMENT DETAILS
                </span>

                <h2 id="department-modal-title">
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p>Enter the department information below.</p>
              </div>

              <button
                type="button"
                className="department-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="department-form"
              onSubmit={handleSubmit}
            >
              <div className="department-form-grid">
                <label className="department-form-field">
                  <span>Department Name *</span>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Water Supply"
                    maxLength={100}
                    required
                    disabled={saving}
                  />
                </label>

                <label className="department-form-field">
                  <span>Department Head</span>

                  <input
                    name="headName"
                    value={form.headName}
                    onChange={handleChange}
                    placeholder="Enter head's name"
                    maxLength={100}
                    disabled={saving}
                  />
                </label>

                <label className="department-form-field">
                  <span>Contact Email</span>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="department@example.com"
                    disabled={saving}
                  />

                  <small>
                    This is the department contact email. A login
                    account is created separately.
                  </small>
                </label>

                <label className="department-form-field">
                  <span>Phone Number</span>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    maxLength={20}
                    disabled={saving}
                  />
                </label>

                <label className="department-form-field department-field-full">
                  <span>Office Location</span>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter office location"
                    maxLength={150}
                    disabled={saving}
                  />
                </label>

                <label className="department-form-field department-field-full">
                  <span>Description *</span>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the department's responsibilities..."
                    rows={4}
                    maxLength={500}
                    required
                    disabled={saving}
                  />

                  <small>
                    {form.description.length}/500 characters
                  </small>
                </label>

                <label className="department-form-field department-field-full">
                  <span>Department Status</span>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="department-form-actions">
                <button
                  type="button"
                  className="department-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="departments-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="departments-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingDepartment ? (
                        <Pencil size={16} />
                      ) : (
                        <Plus size={17} />
                      )}

                      {editingDepartment
                        ? "Save Changes"
                        : "Add Department"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* CREATE DEPARTMENT LOGIN MODAL */}

      {staffModalOpen && selectedDepartment && (
        <div
          className="department-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeStaffModal();
            }
          }}
        >
          <section
            className="department-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-modal-title"
          >
            <div className="department-modal-header">
              <div>
                <span className="departments-eyebrow">
                  DEPARTMENT STAFF ACCESS
                </span>

                <h2 id="staff-modal-title">
                  Create Login Account
                </h2>

                <p>
                  Create credentials for{" "}
                  <strong>{selectedDepartment.name}</strong>.
                </p>
              </div>

              <button
                type="button"
                className="department-modal-close"
                onClick={closeStaffModal}
                disabled={creatingStaff}
                aria-label="Close staff form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="department-staff-info">
              <KeyRound size={19} />

              <p>
                This account will be assigned to{" "}
                <strong>{selectedDepartment.name}</strong> and can sign
                in through your Department Login page.
              </p>
            </div>

            <form
              className="department-form"
              onSubmit={handleCreateStaff}
            >
              <div className="department-form-grid">
                <label className="department-form-field department-field-full">
                  <span>Staff Member Name *</span>

                  <input
                    type="text"
                    name="fullName"
                    value={staffForm.fullName}
                    onChange={handleStaffChange}
                    placeholder="Enter staff member's name"
                    maxLength={100}
                    autoComplete="name"
                    required
                    disabled={creatingStaff}
                  />
                </label>

                <label className="department-form-field department-field-full">
                  <span>Login Email *</span>

                  <input
                    type="email"
                    name="email"
                    value={staffForm.email}
                    onChange={handleStaffChange}
                    placeholder="staff@example.com"
                    autoComplete="email"
                    required
                    disabled={creatingStaff}
                  />

                  <small>
                    The staff member will use this email to log in.
                  </small>
                </label>

                <label className="department-form-field">
                  <span>Password *</span>

                  <input
                    type="password"
                    name="password"
                    value={staffForm.password}
                    onChange={handleStaffChange}
                    placeholder="At least 8 characters"
                    minLength={8}
                    autoComplete="new-password"
                    required
                    disabled={creatingStaff}
                  />
                </label>

                <label className="department-form-field">
                  <span>Confirm Password *</span>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={staffForm.confirmPassword}
                    onChange={handleStaffChange}
                    placeholder="Enter password again"
                    minLength={8}
                    autoComplete="new-password"
                    required
                    disabled={creatingStaff}
                  />
                </label>
              </div>

              <div className="department-form-actions">
                <button
                  type="button"
                  className="department-cancel-btn"
                  onClick={closeStaffModal}
                  disabled={creatingStaff}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="departments-primary-btn"
                  disabled={creatingStaff}
                >
                  {creatingStaff ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="departments-spin"
                      />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Create Login Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Departments;