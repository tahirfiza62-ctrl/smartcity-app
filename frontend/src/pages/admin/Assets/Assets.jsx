
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit3,
  Eye,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  X,
  Activity,
} from "lucide-react";

import "./Assets.css";

const API_URL = "http://localhost:3000/api/admin/assets";

const CATEGORIES = [
  "Street Light",
  "Waste Bin",
  "Road",
  "Water Supply",
  "Public Park",
  "Vehicle",
  "Equipment",
  "Other",
];

const STATUSES = [
  "Available",
  "Assigned",
  "Under Maintenance",
  "Retired",
];

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

const EMPTY_FORM = {
  assetId: "",
  name: "",
  category: "Street Light",
  department: "",
  location: "",
  condition: "Good",
  status: "Available",
  purchaseDate: "",
  purchaseCost: "",
  description: "",
};

const getToken = () =>
  localStorage.getItem("smartcity_admin_token") ||
  localStorage.getItem("smartcity_token");

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

const getErrorMessage = (error, fallback) =>
  error?.message || fallback;

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [modal, setModal] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  /* =====================================================
     API REQUEST HELPER
  ===================================================== */

  const request = useCallback(async (url, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Admin token not found. Please sign in to the admin panel again."
      );
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }, []);

  /* =====================================================
     FETCH ASSETS
     State updates happen after the asynchronous request.
  ===================================================== */

  const fetchAssets = useCallback(
    async (signal) => {
      try {
        const data = await request(API_URL, { signal });

        if (signal?.aborted) return;

        setError("");
        setAssets(Array.isArray(data.assets) ? data.assets : []);
      } catch (err) {
        if (err.name === "AbortError" || signal?.aborted) {
          return;
        }

        console.error("FETCH ASSETS ERROR:", err);

        setError(
          getErrorMessage(err, "Could not load assets.")
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [request]
  );

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    const controller = new AbortController();

    const loadAssets = async () => {
      await fetchAssets(controller.signal);
    };

    loadAssets();

    return () => {
      controller.abort();
    };
  }, [fetchAssets]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats = useMemo(
    () => ({
      total: assets.length,
      available: assets.filter(
        (asset) => asset.status === "Available"
      ).length,
      assigned: assets.filter(
        (asset) => asset.status === "Assigned"
      ).length,
      maintenance: assets.filter(
        (asset) => asset.status === "Under Maintenance"
      ).length,
      poor: assets.filter(
        (asset) => asset.condition === "Poor"
      ).length,
    }),
    [assets]
  );

  /* =====================================================
     SEARCH AND FILTER
  ===================================================== */

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch = [
        asset.assetId,
        asset.name,
        asset.department,
        asset.location,
        asset.category,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      );

      const matchesCategory =
        categoryFilter === "All" ||
        asset.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        asset.status === statusFilter;

      const matchesCondition =
        conditionFilter === "All" ||
        asset.condition === conditionFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesCondition
      );
    });
  }, [
    assets,
    search,
    categoryFilter,
    statusFilter,
    conditionFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleAssets = filteredAssets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    await fetchAssets();
  };

  /* =====================================================
     ADD ASSET
  ===================================================== */

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSelectedAsset(null);
    setError("");
    setNotice("");
    setModal("form");
  };

  /* =====================================================
     EDIT ASSET
  ===================================================== */

  const openEdit = (asset) => {
    setSelectedAsset(asset);

    setForm({
      assetId: asset.assetId || "",
      name: asset.name || "",
      category: asset.category || "Street Light",
      department: asset.department || "",
      location: asset.location || "",
      condition: asset.condition || "Good",
      status: asset.status || "Available",
      purchaseDate: asset.purchaseDate
        ? String(asset.purchaseDate).slice(0, 10)
        : "",
      purchaseCost: asset.purchaseCost ?? "",
      description: asset.description || "",
    });

    setError("");
    setNotice("");
    setModal("form");
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) return;

    setModal("");
    setSelectedAsset(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  /* =====================================================
     FORM INPUT CHANGES
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     SAVE ASSET
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setNotice("");

    if (
      !form.assetId.trim() ||
      !form.name.trim() ||
      !form.department.trim() ||
      !form.location.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      form.purchaseCost !== "" &&
      (!Number.isFinite(Number(form.purchaseCost)) ||
        Number(form.purchaseCost) < 0)
    ) {
      setError("Enter a valid, non-negative purchase cost.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(selectedAsset);

      const payload = {
        ...form,
        assetId: form.assetId.trim().toUpperCase(),
        name: form.name.trim(),
        department: form.department.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        purchaseCost:
          form.purchaseCost === ""
            ? 0
            : Number(form.purchaseCost),
      };

      const data = await request(
        isEditing
          ? `${API_URL}/${selectedAsset._id}`
          : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!data.asset) {
        throw new Error(
          "The server did not return the saved asset."
        );
      }

      if (isEditing) {
        setAssets((previous) =>
          previous.map((asset) =>
            asset._id === selectedAsset._id
              ? data.asset
              : asset
          )
        );
      } else {
        setAssets((previous) => [
          data.asset,
          ...previous,
        ]);

        setPage(1);
      }

      setModal("");
      setSelectedAsset(null);
      setForm(EMPTY_FORM);

      setNotice(
        data.message || "Asset saved successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not save asset.")
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE ASSET
  ===================================================== */

  const handleDelete = async (asset) => {
    const confirmed = window.confirm(
      `Delete "${asset.name}" (${asset.assetId})? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const data = await request(
        `${API_URL}/${asset._id}`,
        {
          method: "DELETE",
        }
      );

      setAssets((previous) =>
        previous.filter((item) => item._id !== asset._id)
      );

      setNotice(
        data.message || "Asset deleted successfully."
      );

      setModal("");
      setSelectedAsset(null);
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not delete asset.")
      );
    }
  };

  /* =====================================================
     VIEW DETAILS
  ===================================================== */

  const openDetails = (asset) => {
    setSelectedAsset(asset);
    setModal("details");
    setError("");
  };

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setConditionFilter("All");
    setPage(1);
  };

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const statusClass = (status) =>
    String(status || "available")
      .toLowerCase()
      .replace(/\s+/g, "-");

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="assets-page">
      {/* PAGE HEADER */}

      <div className="assets-heading">
        <div>
          <span className="assets-eyebrow">
            SMARTCITY ADMINISTRATION
          </span>

          <h1>Assets Management</h1>

          <p>
            Track city infrastructure, equipment, locations and maintenance.
          </p>
        </div>

        <div className="assets-heading-actions">
          <button
            type="button"
            className="assets-btn assets-btn-light"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "assets-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            className="assets-btn assets-btn-primary"
            onClick={openAdd}
          >
            <Plus size={18} />
            Add Asset
          </button>
        </div>
      </div>

      {/* SUCCESS NOTICE */}

      {notice && (
        <div className="assets-alert assets-alert-success">
          <CheckCircle2 size={18} />
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notice"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ERROR NOTICE */}

      {error && modal !== "form" && (
        <div className="assets-alert assets-alert-error">
          <AlertTriangle size={18} />
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

      {/* STATISTICS */}

      <div className="assets-stats-grid">
        <StatCard
          label="Total Assets"
          value={stats.total}
          icon={<Boxes size={22} />}
          variant="blue"
        />

        <StatCard
          label="Available"
          value={stats.available}
          icon={<CheckCircle2 size={22} />}
          variant="green"
        />

        <StatCard
          label="Assigned"
          value={stats.assigned}
          icon={<ClipboardList size={22} />}
          variant="purple"
        />

        <StatCard
          label="Under Maintenance"
          value={stats.maintenance}
          icon={<Wrench size={22} />}
          variant="orange"
        />
      </div>

      {/* POOR CONDITION WARNING */}

      {stats.poor > 0 && (
        <div className="assets-maintenance-notice">
          <AlertTriangle size={19} />

          <span>
            <strong>{stats.poor} asset(s)</strong> are marked in poor
            condition and may need inspection.
          </span>
        </div>
      )}

      {/* ASSETS TABLE */}

      <section className="assets-table-card">
        <div className="assets-table-heading">
          <div>
            <h2>City Assets</h2>
            <p>View and manage registered city resources.</p>
          </div>

          <span className="assets-count-pill">
            {filteredAssets.length} records
          </span>
        </div>

        {/* FILTERS */}

        <div className="assets-filters">
          <div className="assets-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search name, asset ID, department..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Categories</option>

            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Statuses</option>

            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by condition"
            value={conditionFilter}
            onChange={(event) => {
              setConditionFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Conditions</option>

            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>

          {(search ||
            categoryFilter !== "All" ||
            statusFilter !== "All" ||
            conditionFilter !== "All") && (
            <button
              type="button"
              className="assets-reset-btn"
              onClick={resetFilters}
            >
              Reset
            </button>
          )}
        </div>

        {/* LOADING STATE */}

        {loading ? (
          <div className="assets-state">
            <RefreshCw
              size={28}
              className="assets-spin"
            />

            <h3>Loading assets...</h3>
            <p>Please wait while we retrieve your records.</p>
          </div>
        ) : error && assets.length === 0 ? (
          <div className="assets-state assets-state-error">
            <AlertTriangle size={30} />

            <h3>Unable to load assets</h3>
            <p>{error}</p>

            <button
              type="button"
              className="assets-btn assets-btn-primary"
              onClick={handleRefresh}
            >
              Try Again
            </button>
          </div>
        ) : visibleAssets.length === 0 ? (
          <div className="assets-state">
            <Boxes size={34} />

            <h3>
              {assets.length === 0
                ? "No assets registered yet"
                : "No assets found"}
            </h3>

            <p>
              {assets.length === 0
                ? "Add your first city asset to start managing infrastructure."
                : "Try changing your search terms or filters."}
            </p>

            {assets.length === 0 ? (
              <button
                type="button"
                className="assets-btn assets-btn-primary"
                onClick={openAdd}
              >
                <Plus size={17} />
                Add First Asset
              </button>
            ) : (
              <button
                type="button"
                className="assets-btn assets-btn-light"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* TABLE */}

            <div className="assets-table-wrap">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleAssets.map((asset) => (
                    <tr key={asset._id}>
                      <td>
                        <div className="assets-name-cell">
                          <div className="assets-row-icon">
                            <Boxes size={19} />
                          </div>

                          <div>
                            <strong>{asset.name}</strong>
                            <span>{asset.assetId}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="assets-category-text">
                          {asset.category}
                        </span>
                      </td>

                      <td>
                        <div className="assets-icon-text">
                          <Building2 size={15} />
                          <span>{asset.department}</span>
                        </div>
                      </td>

                      <td>
                        <div className="assets-icon-text">
                          <MapPin size={15} />
                          <span>{asset.location}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`assets-condition condition-${String(
                            asset.condition || "Good"
                          ).toLowerCase()}`}
                        >
                          {asset.condition || "Good"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`assets-status status-${statusClass(
                            asset.status
                          )}`}
                        >
                          <span className="assets-status-dot" />
                          {asset.status || "Available"}
                        </span>
                      </td>

                      <td>
                        <div className="assets-row-actions">
                          <button
                            type="button"
                            className="assets-icon-btn"
                            title="View details"
                            aria-label={`View ${asset.name}`}
                            onClick={() => openDetails(asset)}
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className="assets-icon-btn"
                            title="Edit asset"
                            aria-label={`Edit ${asset.name}`}
                            onClick={() => openEdit(asset)}
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            className="assets-icon-btn assets-delete-btn"
                            title="Delete asset"
                            aria-label={`Delete ${asset.name}`}
                            onClick={() => handleDelete(asset)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="assets-pagination">
              <span>
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * pageSize + 1,
                  filteredAssets.length
                )}
                –
                {Math.min(
                  currentPage * pageSize,
                  filteredAssets.length
                )}{" "}
                of {filteredAssets.length} assets
              </span>

              <div>
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setPage((previous) => Math.max(1, previous - 1))
                  }
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="assets-page-number">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((previous) =>
                      Math.min(totalPages, previous + 1)
                    )
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ADD / EDIT MODAL */}

      {modal === "form" && (
        <div
          className="assets-modal-backdrop"
          onMouseDown={closeModal}
        >
          <section
            className="assets-modal assets-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assets-form-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="assets-modal-header">
              <div>
                <span className="assets-eyebrow">ASSET RECORD</span>

                <h2 id="assets-form-title">
                  {selectedAsset ? "Edit Asset" : "Add New Asset"}
                </h2>

                <p>
                  {selectedAsset
                    ? "Update the information for this city asset."
                    : "Enter the details of the new city asset."}
                </p>
              </div>

              <button
                type="button"
                className="assets-modal-close"
                onClick={closeModal}
                aria-label="Close dialog"
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="assets-alert assets-alert-error">
                <AlertTriangle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form className="assets-form" onSubmit={handleSubmit}>
              <div className="assets-form-grid">
                <FormField label="Asset ID *">
                  <input
                    name="assetId"
                    value={form.assetId}
                    onChange={handleChange}
                    placeholder="e.g. AST-1001"
                    required
                    maxLength={40}
                  />
                </FormField>

                <FormField label="Asset Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Main Road Street Light"
                    required
                    maxLength={120}
                  />
                </FormField>

                <FormField label="Category *">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Department *">
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Public Works"
                    required
                    maxLength={120}
                  />
                </FormField>

                <FormField label="Location *">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Street, sector or area"
                    required
                    maxLength={200}
                  />
                </FormField>

                <FormField label="Condition">
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                  >
                    {CONDITIONS.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Purchase Date">
                  <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Purchase Cost (PKR)">
                  <input
                    type="number"
                    name="purchaseCost"
                    value={form.purchaseCost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </FormField>

                <FormField label="Description" wide>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Additional details about this asset..."
                    rows={3}
                    maxLength={1000}
                  />
                </FormField>
              </div>

              <div className="assets-form-footer">
                <button
                  type="button"
                  className="assets-btn assets-btn-light"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="assets-btn assets-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="assets-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {selectedAsset ? "Save Changes" : "Add Asset"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ASSET DETAILS MODAL */}

      {modal === "details" && selectedAsset && (
        <div
          className="assets-modal-backdrop"
          onMouseDown={() => setModal("")}
        >
          <section
            className="assets-modal assets-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assets-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="assets-modal-header">
              <div>
                <span className="assets-eyebrow">
                  {selectedAsset.assetId}
                </span>

                <h2 id="assets-details-title">
                  {selectedAsset.name}
                </h2>

                <p>{selectedAsset.category}</p>
              </div>

              <button
                type="button"
                className="assets-modal-close"
                onClick={() => setModal("")}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="assets-details-banner">
              <div className="assets-details-icon">
                <Boxes size={28} />
              </div>

              <div>
                <span className="assets-details-label">
                  Current status
                </span>

                <span
                  className={`assets-status status-${statusClass(
                    selectedAsset.status
                  )}`}
                >
                  <span className="assets-status-dot" />
                  {selectedAsset.status || "Available"}
                </span>
              </div>
            </div>

            <div className="assets-details-grid">
              <DetailItem
                label="Department"
                value={selectedAsset.department}
                icon={<Building2 size={17} />}
              />

              <DetailItem
                label="Location"
                value={selectedAsset.location}
                icon={<MapPin size={17} />}
              />

              <DetailItem
                label="Condition"
                value={selectedAsset.condition}
                icon={<Activity size={17} />}
              />

              <DetailItem
                label="Purchase Date"
                value={formatDate(selectedAsset.purchaseDate)}
                icon={<CalendarDays size={17} />}
              />

              <DetailItem
                label="Purchase Cost"
                value={formatMoney(selectedAsset.purchaseCost)}
                icon={<ClipboardList size={17} />}
              />

              <DetailItem
                label="Registered On"
                value={formatDate(selectedAsset.createdAt)}
                icon={<CalendarDays size={17} />}
              />
            </div>

            <div className="assets-description-box">
              <h3>Description</h3>

              <p>
                {selectedAsset.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="assets-form-footer">
              <button
                type="button"
                className="assets-btn assets-btn-light"
                onClick={() => setModal("")}
              >
                Close
              </button>

              <button
                type="button"
                className="assets-btn assets-btn-primary"
                onClick={() => openEdit(selectedAsset)}
              >
                <Edit3 size={16} />
                Edit Asset
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   STATISTICS CARD
===================================================== */

function StatCard({ label, value, icon, variant }) {
  return (
    <div className="assets-stat-card">
      <div className={`assets-stat-icon ${variant}`}>
        {icon}
      </div>

      <div className="assets-stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =====================================================
   FORM FIELD
===================================================== */

function FormField({ label, children, wide }) {
  return (
    <label
      className={`assets-field ${
        wide ? "assets-field-wide" : ""
      }`}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}

/* =====================================================
   DETAIL ITEM
===================================================== */

function DetailItem({ label, value, icon }) {
  return (
    <div className="assets-detail-item">
      <div className="assets-detail-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value || "—"}</strong>
      </div>
    </div>
  );
}

export default Assets;

