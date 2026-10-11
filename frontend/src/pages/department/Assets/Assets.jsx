import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Package,
  Plus,
  X,
  Search,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import "./Assets.css";

const API_URL = "http://localhost:3000";

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    condition: "Good",
    status: "Active",
    description: "",
  });

  const token = localStorage.getItem("department_token");

  /* =====================================================
     FETCH ASSETS
  ===================================================== */

  const fetchAssets = useCallback(async () => {
    if (!token) {
      window.location.href = "/department-login";
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/assets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssets(response.data?.assets || []);
    } catch (error) {
      console.error("FETCH ASSETS ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("smartcity_token");
        localStorage.removeItem("smartcity_user");

        toast.error("Your session has expired.");

        window.location.href = "/department-login";
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to load assets."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* =====================================================
     LOAD ASSETS
  ===================================================== */

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     OPEN ADD FORM
  ===================================================== */

  const openAddForm = () => {
    setEditingAsset(null);

    setForm({
      name: "",
      type: "",
      location: "",
      condition: "Good",
      status: "Active",
      description: "",
    });

    setShowForm(true);
  };

  /* =====================================================
     OPEN EDIT FORM
  ===================================================== */

  const openEditForm = (asset) => {
    setEditingAsset(asset);

    setForm({
      name: asset.name || "",
      type: asset.type || "",
      location: asset.location || "",
      condition: asset.condition || "Good",
      status: asset.status || "Active",
      description: asset.description || "",
    });

    setShowForm(true);
  };

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  const closeForm = () => {
    setShowForm(false);
    setEditingAsset(null);

    setForm({
      name: "",
      type: "",
      location: "",
      condition: "Good",
      status: "Active",
      description: "",
    });
  };

  /* =====================================================
     SUBMIT ASSET
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const type = form.type.trim();
    const location = form.location.trim();

    if (!name || !type || !location) {
      toast.error("Please fill all required fields.");
      return;
    }

    const cleanedForm = {
      ...form,
      name,
      type,
      location,
      description: form.description.trim(),
    };

    try {
      if (editingAsset) {
        await axios.patch(
          `${API_URL}/api/assets/${editingAsset._id}`,
          cleanedForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Asset updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/api/assets`,
          cleanedForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Asset created successfully.");
      }

      closeForm();

      await fetchAssets();
    } catch (error) {
      console.error("SAVE ASSET ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("smartcity_token");
        localStorage.removeItem("smartcity_user");

        toast.error("Your session has expired.");

        window.location.href = "/department-login";
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to save asset."
      );
    }
  };

  /* =====================================================
     DELETE ASSET
  ===================================================== */

  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid asset.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/api/assets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Asset deleted successfully.");

      await fetchAssets();
    } catch (error) {
      console.error("DELETE ASSET ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("smartcity_token");
        localStorage.removeItem("smartcity_user");

        toast.error("Your session has expired.");

        window.location.href = "/department-login";
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to delete asset."
      );
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredAssets = assets.filter((asset) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      asset.assetId?.toLowerCase().includes(query) ||
      asset.name?.toLowerCase().includes(query) ||
      asset.type?.toLowerCase().includes(query) ||
      asset.location?.toLowerCase().includes(query) ||
      asset.condition?.toLowerCase().includes(query) ||
      asset.status?.toLowerCase().includes(query)
    );
  });

  /* =====================================================
     STATS
  ===================================================== */

  const totalAssets = assets.length;

  const activeAssets = assets.filter(
    (asset) => asset.status === "Active"
  ).length;

  const maintenanceAssets = assets.filter(
    (asset) => asset.status === "Under Maintenance"
  ).length;

  const criticalAssets = assets.filter(
    (asset) => asset.condition === "Critical"
  ).length;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="department-assets-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="assets-page-header">

        <div className="assets-header-left">

          <div className="assets-header-icon">
            <Package size={29} />
          </div>

          <div>
            <span className="assets-eyebrow">
              DEPARTMENT OPERATIONS
            </span>

            <h1>Department Assets</h1>

            <p>
              Monitor and manage assets assigned
              to your department.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="add-asset-btn"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Asset
        </button>

      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="assets-stats">

        <div className="asset-stat">

          <Package size={21} />

          <div>
            <span>Total Assets</span>

            <strong>{totalAssets}</strong>
          </div>

        </div>

        <div className="asset-stat">

          <div className="asset-stat-dot active" />

          <div>
            <span>Active</span>

            <strong>{activeAssets}</strong>
          </div>

        </div>

        <div className="asset-stat">

          <div className="asset-stat-dot maintenance" />

          <div>
            <span>Maintenance</span>

            <strong>{maintenanceAssets}</strong>
          </div>

        </div>

        <div className="asset-stat">

          <div className="asset-stat-dot critical" />

          <div>
            <span>Critical Condition</span>

            <strong>{criticalAssets}</strong>
          </div>

        </div>

      </div>

      {/* =================================================
          ASSET INVENTORY
      ================================================= */}

      <div className="assets-card">

        <div className="assets-card-header">

          <div>
            <h2>Asset Inventory</h2>

            <p>
              Assets belonging to your department.
            </p>
          </div>

          <div className="assets-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="assets-empty">
            <Package size={36} />

            <h3>Loading assets...</h3>

            <p>
              Please wait while assets are loaded.
            </p>
          </div>
        ) : filteredAssets.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="assets-empty">

            <Package size={42} />

            <h3>
              {search
                ? "No matching assets found"
                : "No assets found"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "Add your first department asset to begin."}
            </p>

            {!search && (
              <button
                type="button"
                className="add-asset-btn empty-add-btn"
                onClick={openAddForm}
              >
                <Plus size={17} />
                Add Asset
              </button>
            )}

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="assets-table-wrapper">

            <table className="assets-table">

              <thead>
                <tr>

                  <th>Asset ID</th>

                  <th>Asset</th>

                  <th>Type</th>

                  <th>Location</th>

                  <th>Condition</th>

                  <th>Status</th>

                  <th>Actions</th>

                </tr>
              </thead>

              <tbody>

                {filteredAssets.map((asset) => {

                  const conditionClass =
                    asset.condition
                      ?.toLowerCase()
                      .replace(/\s+/g, "-");

                  const statusClass =
                    asset.status
                      ?.toLowerCase()
                      .replace(/\s+/g, "-");

                  return (
                    <tr key={asset._id}>

                      {/* ASSET ID */}

                      <td>
                        <strong className="asset-id">
                          {asset.assetId || "N/A"}
                        </strong>
                      </td>

                      {/* NAME */}

                      <td>
                        <strong>
                          {asset.name || "Unnamed Asset"}
                        </strong>
                      </td>

                      {/* TYPE */}

                      <td>
                        {asset.type || "N/A"}
                      </td>

                      {/* LOCATION */}

                      <td>

                        <span className="asset-location">

                          <MapPin size={14} />

                          {asset.location || "N/A"}

                        </span>

                      </td>

                      {/* CONDITION */}

                      <td>

                        <span
                          className={`asset-condition ${
                            conditionClass || ""
                          }`}
                        >
                          {asset.condition || "N/A"}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`asset-status ${
                            statusClass || ""
                          }`}
                        >
                          {asset.status || "N/A"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="asset-actions">

                          <button
                            type="button"
                            className="edit-asset-btn"
                            title="Edit asset"
                            onClick={() =>
                              openEditForm(asset)
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="delete-asset-btn"
                            title="Delete asset"
                            onClick={() =>
                              handleDelete(
                                asset._id
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (

        <div
          className="asset-modal-overlay"
          onClick={closeForm}
        >

          <div
            className="asset-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="asset-modal-header">

              <div>

                <span>
                  ASSET MANAGEMENT
                </span>

                <h2>
                  {editingAsset
                    ? "Edit Asset"
                    : "Add New Asset"}
                </h2>

              </div>

              <button
                type="button"
                className="asset-close-btn"
                onClick={closeForm}
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="asset-form"
              onSubmit={handleSubmit}
            >

              {/* NAME + TYPE */}

              <div className="asset-form-row">

                <div className="asset-form-group">

                  <label htmlFor="asset-name">
                    Asset Name *
                  </label>

                  <input
                    id="asset-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Water Pump 01"
                    value={form.name}
                    onChange={handleChange}
                  />

                </div>

                <div className="asset-form-group">

                  <label htmlFor="asset-type">
                    Asset Type *
                  </label>

                  <input
                    id="asset-type"
                    type="text"
                    name="type"
                    placeholder="e.g. Water Pump"
                    value={form.type}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* LOCATION */}

              <div className="asset-form-group">

                <label htmlFor="asset-location">
                  Location *
                </label>

                <input
                  id="asset-location"
                  type="text"
                  name="location"
                  placeholder="Asset location"
                  value={form.location}
                  onChange={handleChange}
                />

              </div>

              {/* CONDITION + STATUS */}

              <div className="asset-form-row">

                <div className="asset-form-group">

                  <label htmlFor="asset-condition">
                    Condition
                  </label>

                  <select
                    id="asset-condition"
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                  >

                    <option value="Excellent">
                      Excellent
                    </option>

                    <option value="Good">
                      Good
                    </option>

                    <option value="Needs Maintenance">
                      Needs Maintenance
                    </option>

                    <option value="Critical">
                      Critical
                    </option>

                  </select>

                </div>

                <div className="asset-form-group">

                  <label htmlFor="asset-status">
                    Status
                  </label>

                  <select
                    id="asset-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Under Maintenance">
                      Under Maintenance
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="asset-form-group">

                <label htmlFor="asset-description">
                  Description
                </label>

                <textarea
                  id="asset-description"
                  name="description"
                  rows="4"
                  placeholder="Describe the asset..."
                  value={form.description}
                  onChange={handleChange}
                />

              </div>

              {/* FORM ACTIONS */}

              <div className="asset-form-actions">

                <button
                  type="button"
                  className="cancel-asset-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-asset-btn"
                >

                  <Package size={17} />

                  {editingAsset
                    ? "Update Asset"
                    : "Create Asset"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Assets;