
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Eye,
  X,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import "./Citizens.css";

const API_URL = "http://localhost:3000/api";
const PAGE_SIZE = 8;

const getToken = () =>
  localStorage.getItem("smartcity_admin_token") ||
  localStorage.getItem("smartcity_token");

const getName = (citizen) =>
  citizen.fullName || citizen.name || "Unnamed Citizen";

const getStatus = (citizen) => {
  const value = String(citizen.status || "active").toLowerCase();

  return value === "inactive" || value === "blocked"
    ? "inactive"
    : "active";
};

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

const getRecords = (data) => {
  const records = Array.isArray(data)
    ? data
    : data.citizens || data.users || data.data || [];

  return Array.isArray(records) ? records : [];
};

function Citizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [updatingId, setUpdatingId] = useState("");
  const [notice, setNotice] = useState("");

  // Initial API request.
  // State updates happen after the asynchronous request completes.
  useEffect(() => {
    let cancelled = false;

    const fetchInitialCitizens = async () => {
      try {
        const token = getToken();

        if (!token) {
          throw new Error(
            "Please log in to your admin account first."
          );
        }

        const response = await fetch(
          `${API_URL}/admin/citizens`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load citizens."
          );
        }

        const records = getRecords(data);

        if (!cancelled) {
          setCitizens(records);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInitialCitizens();

    return () => {
      cancelled = true;
    };
  }, []);

  // Manual refresh.
  const loadCitizens = useCallback(async () => {
    setRefreshing(true);
    setError("");
    setNotice("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Please log in to your admin account first."
        );
      }

      const response = await fetch(
        `${API_URL}/admin/citizens`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load citizens."
        );
      }

      setCitizens(getRecords(data));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Statistics.
  const stats = useMemo(() => {
    const active = citizens.filter(
      (citizen) => getStatus(citizen) === "active"
    ).length;

    return {
      total: citizens.length,
      active,
      inactive: citizens.length - active,
    };
  }, [citizens]);

  // Search and filter.
  const filteredCitizens = useMemo(() => {
    const term = search.trim().toLowerCase();

    return citizens.filter((citizen) => {
      const matchesSearch = [
        getName(citizen),
        citizen.email,
        citizen.phone,
        citizen.phoneNumber,
        citizen.fullName,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(citizen) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [citizens, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCitizens.length / PAGE_SIZE)
  );

  // Derive a valid page instead of updating page inside an effect.
  const safePage = Math.min(page, totalPages);

  const visibleCitizens = filteredCitizens.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // Reset pagination directly when the user changes search.
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  // Reset pagination directly when the user changes filters.
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  // Activate or deactivate a citizen.
  const updateStatus = async (citizen) => {
    const currentStatus = getStatus(citizen);

    const nextStatus =
      currentStatus === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus === "active" ? "activate" : "deactivate"
      } ${getName(citizen)}'s account?`
    );

    if (!confirmed) return;

    setUpdatingId(citizen._id);
    setNotice("");
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Please log in to your admin account first."
        );
      }

      const response = await fetch(
        `${API_URL}/admin/citizens/${citizen._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update the citizen's status."
        );
      }

      const updatedCitizen = data.citizen || {
        ...citizen,
        status: nextStatus,
      };

      setCitizens((previous) =>
        previous.map((item) =>
          item._id === citizen._id
            ? { ...item, ...updatedCitizen }
            : item
        )
      );

      setSelectedCitizen((previous) =>
        previous?._id === citizen._id
          ? { ...previous, ...updatedCitizen }
          : previous
      );

      setNotice(
        `${getName(citizen)}'s account is now ${nextStatus}.`
      );
    } catch (err) {
      setError(
        err.message || "Unable to update account status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getInitials = (citizen) =>
    getName(citizen)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "C";

  return (
    <main className="citizens-page">
      <header className="citizens-page-header">
        <div>
          <div className="citizens-eyebrow">
            <span className="citizens-eyebrow-dot" />
            CIVIC CONNECT / ADMINISTRATION
          </div>

          <h1>Citizens Management</h1>

          <p>
            View registered citizens and manage their account status.
          </p>
        </div>

        <button
          type="button"
          className="citizens-refresh-btn"
          onClick={loadCitizens}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "citizens-spinning" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div
          className="citizens-alert citizens-alert-error"
          role="alert"
        >
          <AlertCircle size={19} />

          <span>{error}</span>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {notice && (
        <div
          className="citizens-alert citizens-alert-success"
          role="status"
        >
          <ShieldCheck size={19} />

          <span>{notice}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="citizens-stats-grid">
        <article className="citizens-stat-card">
          <div className="citizens-stat-icon citizens-icon-blue">
            <Users size={23} />
          </div>

          <div>
            <p>Total Citizens</p>
            <h2>
              {loading ? "—" : stats.total.toLocaleString()}
            </h2>
            <span>Registered accounts</span>
          </div>
        </article>

        <article className="citizens-stat-card">
          <div className="citizens-stat-icon citizens-icon-green">
            <UserCheck size={23} />
          </div>

          <div>
            <p>Active Citizens</p>
            <h2>
              {loading ? "—" : stats.active.toLocaleString()}
            </h2>
            <span>Currently active accounts</span>
          </div>
        </article>

        <article className="citizens-stat-card">
          <div className="citizens-stat-icon citizens-icon-red">
            <UserX size={23} />
          </div>

          <div>
            <p>Inactive Citizens</p>
            <h2>
              {loading ? "—" : stats.inactive.toLocaleString()}
            </h2>
            <span>Inactive or blocked accounts</span>
          </div>
        </article>
      </section>

      <section className="citizens-table-panel">
        <div className="citizens-panel-heading">
          <div>
            <h2>Registered Citizens</h2>
            <p>Search and manage citizen accounts.</p>
          </div>

          <span className="citizens-result-count">
            {filteredCitizens.length}{" "}
            {filteredCitizens.length === 1
              ? "citizen"
              : "citizens"}
          </span>
        </div>

        <div className="citizens-toolbar">
          <label className="citizens-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search name, email or phone..."
              value={search}
              onChange={handleSearchChange}
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                <X size={16} />
              </button>
            )}
          </label>

          <select
            className="citizens-status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            aria-label="Filter by account status"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {loading ? (
          <div className="citizens-loading">
            <span className="citizens-loader" />
            <p>Loading citizen records...</p>
          </div>
        ) : (
          <>
            <div className="citizens-table-scroll">
              <table className="citizens-table">
                <thead>
                  <tr>
                    <th>Citizen</th>
                    <th>Contact Information</th>
                    <th>Registered On</th>
                    <th>Account Status</th>
                    <th className="citizens-actions-heading">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCitizens.map((citizen) => {
                    const status = getStatus(citizen);

                    return (
                      <tr key={citizen._id}>
                        <td>
                          <div className="citizens-person-cell">
                            <div className="citizens-avatar">
                              {getInitials(citizen)}
                            </div>

                            <div className="citizens-person-info">
                              <strong>{getName(citizen)}</strong>

                              <span>
                                ID:{" "}
                                {String(citizen._id || "").slice(-8) ||
                                  "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="citizens-contact-cell">
                            <span>
                              <Mail size={14} />
                              {citizen.email || "No email"}
                            </span>

                            <span>
                              <Phone size={14} />
                              {citizen.phone ||
                                citizen.phoneNumber ||
                                "No phone"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="citizens-date">
                            <CalendarDays size={15} />

                            {formatDate(
                              citizen.createdAt ||
                                citizen.created_at
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`citizens-status-badge ${status}`}
                          >
                            <span />

                            {status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <div className="citizens-row-actions">
                            <button
                              type="button"
                              className="citizens-view-btn"
                              onClick={() =>
                                setSelectedCitizen(citizen)
                              }
                              title="View citizen details"
                              aria-label={`View ${getName(citizen)}`}
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              className={`citizens-toggle-btn ${
                                status === "active"
                                  ? "deactivate"
                                  : "activate"
                              }`}
                              onClick={() => updateStatus(citizen)}
                              disabled={
                                updatingId === citizen._id
                              }
                            >
                              {updatingId === citizen._id
                                ? "Saving..."
                                : status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {visibleCitizens.length === 0 && (
              <div className="citizens-empty">
                <div>
                  <Users size={30} />
                </div>

                <h3>No citizens found</h3>

                <p>
                  {search || statusFilter !== "all"
                    ? "Try changing your search or filter."
                    : "Registered citizens will appear here."}
                </p>

                {(search || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {filteredCitizens.length > 0 && (
              <div className="citizens-pagination">
                <p>
                  Showing{" "}
                  <strong>
                    {(safePage - 1) * PAGE_SIZE + 1}–
                    {Math.min(
                      safePage * PAGE_SIZE,
                      filteredCitizens.length
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong>{filteredCitizens.length}</strong>{" "}
                  citizens
                </p>

                <div className="citizens-pagination-controls">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <span>
                    Page {safePage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(totalPages, current + 1)
                      )
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selectedCitizen && (
        <div
          className="citizens-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCitizen(null);
            }
          }}
        >
          <section
            className="citizens-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="citizens-modal-title"
          >
            <header className="citizens-modal-header">
              <div>
                <span>ACCOUNT PROFILE</span>
                <h2 id="citizens-modal-title">
                  Citizen Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCitizen(null)}
                aria-label="Close citizen details"
              >
                <X size={21} />
              </button>
            </header>

            <div className="citizens-modal-profile">
              <div className="citizens-modal-avatar">
                {getInitials(selectedCitizen)}
              </div>

              <h3>{getName(selectedCitizen)}</h3>

              <p>
                {selectedCitizen.email || "No email provided"}
              </p>

              <span
                className={`citizens-status-badge ${getStatus(
                  selectedCitizen
                )}`}
              >
                <span />

                {getStatus(selectedCitizen) === "active"
                  ? "Active Account"
                  : "Inactive Account"}
              </span>
            </div>

            <div className="citizens-detail-list">
              <div>
                <Mail size={18} />

                <span>
                  <small>Email Address</small>
                  <strong>
                    {selectedCitizen.email || "Not provided"}
                  </strong>
                </span>
              </div>

              <div>
                <Phone size={18} />

                <span>
                  <small>Phone Number</small>
                  <strong>
                    {selectedCitizen.phone ||
                      selectedCitizen.phoneNumber ||
                      "Not provided"}
                  </strong>
                </span>
              </div>

              <div>
                <MapPin size={18} />

                <span>
                  <small>Address</small>
                  <strong>
                    {selectedCitizen.address ||
                      selectedCitizen.city ||
                      "Not provided"}
                  </strong>
                </span>
              </div>

              <div>
                <CalendarDays size={18} />

                <span>
                  <small>Registration Date</small>
                  <strong>
                    {formatDate(
                      selectedCitizen.createdAt ||
                        selectedCitizen.created_at
                    )}
                  </strong>
                </span>
              </div>

              <div>
                <ShieldCheck size={18} />

                <span>
                  <small>Citizen Account ID</small>
                  <strong>
                    {selectedCitizen._id || "—"}
                  </strong>
                </span>
              </div>
            </div>

            <footer className="citizens-modal-footer">
              <button
                type="button"
                className="citizens-modal-close"
                onClick={() => setSelectedCitizen(null)}
              >
                Close
              </button>

              <button
                type="button"
                className={`citizens-modal-status ${
                  getStatus(selectedCitizen) === "active"
                    ? "deactivate"
                    : "activate"
                }`}
                disabled={
                  updatingId === selectedCitizen._id
                }
                onClick={() => updateStatus(selectedCitizen)}
              >
                {updatingId === selectedCitizen._id
                  ? "Saving..."
                  : getStatus(selectedCitizen) === "active"
                    ? "Deactivate Account"
                    : "Activate Account"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

export default Citizens;

