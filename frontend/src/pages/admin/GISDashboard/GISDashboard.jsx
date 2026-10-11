import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import "./GISDashboard.css";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL = "http://localhost:3000/api";

const DEFAULT_CENTER = [33.6844, 73.0479];

const LAYER_OPTIONS = [
  { value: "all", label: "All locations" },
  { value: "emergencies", label: "Emergencies" },
  { value: "complaints", label: "Complaints" },
];

const LAYER_TYPES = {
  emergencies: "emergency",
  complaints: "complaint",
};

/* =========================================================
   ADMIN AUTHENTICATION
========================================================= */

const getAdminToken = () =>
  localStorage.getItem("smartcity_admin_token") ||
  localStorage.getItem("adminToken") ||
  localStorage.getItem("admin_token") ||
  localStorage.getItem("token");

const getHeaders = () => {
  const token = getAdminToken();

  if (!token) {
    throw new Error(
      "Admin authentication token is missing. Please log in again."
    );
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* =========================================================
   MAP MARKER ICON
   Fix: Use a single const expression for marker color.
========================================================= */

const createMarkerIcon = (type, status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  const isResolved = [
    "resolved",
    "cancelled",
    "closed",
    "completed",
  ].includes(normalizedStatus);

  const color = isResolved
    ? "#23966b"
    : type === "emergency"
      ? "#D71920"
      : "#d97706";

  return L.divIcon({
    className: "gis-marker-wrapper",
    html: `
      <div class="gis-marker-pin" style="--marker-color:${color}">
        <span></span>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 38],
    popupAnchor: [0, -35],
  });
};

/* =========================================================
   DATA HELPERS
========================================================= */

const getCoordinates = (item) => {
  const latitude =
    item.latitude ??
    item.lat ??
    item.coordinates?.latitude ??
    item.location?.latitude ??
    item.location?.coordinates?.[1];

  const longitude =
    item.longitude ??
    item.lng ??
    item.lon ??
    item.coordinates?.longitude ??
    item.location?.longitude ??
    item.location?.coordinates?.[0];

  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null ||
    latitude === "" ||
    longitude === ""
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    (lat === 0 && lng === 0)
  ) {
    return null;
  }

  return [lat, lng];
};

const getItemStatus = (item) => {
  const status = String(item.status || "Reported")
    .replaceAll("_", " ")
    .trim();

  return status
    .split(" ")
    .map((word) =>
      word
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : ""
    )
    .join(" ");
};

const getItemTitle = (item, type) =>
  item.title ||
  item.type ||
  item.category ||
  item.emergencyType ||
  (type === "emergency"
    ? "Emergency Report"
    : "Citizen Complaint");

const getItemLocation = (item) => {
  if (typeof item.location === "string") {
    return item.location || "Location not provided";
  }

  return (
    item.address ||
    item.area ||
    item.ward ||
    item.location?.address ||
    "Location not provided"
  );
};

const getItemDate = (item) => {
  const value = item.reportedAt || item.createdAt || item.date;

  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getIdForGIS = (item) =>
  item?._id ||
  item?.id ||
  item?.emergencyId ||
  item?.complaintId;

/* =========================================================
   MAP CONTROLS
========================================================= */

const MapRecenter = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), {
      animate: true,
    });
  }, [center, map]);

  return null;
};

/* =========================================================
   MAIN GIS DASHBOARD
========================================================= */

const GISDashboard = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [layer, setLayer] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  /* =======================================================
     FETCH GIS DATA

     Important:
     This function returns data instead of updating React
     state directly. That avoids the set-state-in-effect
     warning when the page initially loads.
  ======================================================= */

  const fetchGISData = useCallback(async (signal) => {
    try {
      const response = await fetch(`${API_URL}/admin/gis`, {
        method: "GET",
        headers: getHeaders(),
        signal,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Unable to load GIS data. Server returned ${response.status}.`
        );
      }

      if (result.success === false) {
        throw new Error(result.message || "Unable to load GIS data.");
      }

      const data = result.data || result;

      const emergencyRecords = Array.isArray(data.emergencies)
        ? data.emergencies
        : Array.isArray(result.emergencies)
          ? result.emergencies
          : [];

      const complaintRecords = Array.isArray(data.complaints)
        ? data.complaints
        : Array.isArray(result.complaints)
          ? result.complaints
          : [];

      return {
        emergencies: emergencyRecords,
        complaints: complaintRecords,
        error: "",
      };
    } catch (err) {
      if (err.name === "AbortError") {
        return null;
      }

      console.error("GIS DATA ERROR:", err);

      return {
        emergencies: null,
        complaints: null,
        error:
          err.message ||
          "Unable to load GIS data. Check your backend connection.",
      };
    }
  }, []);

  /* =======================================================
     LOAD GIS DATA

     State updates occur after the asynchronous request
     completes, not synchronously in the effect.
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const loadGISData = async () => {
      const result = await fetchGISData(controller.signal);

      if (!result || controller.signal.aborted) {
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setEmergencies(result.emergencies);
        setComplaints(result.complaints);
        setError("");

        console.log("GIS DATA LOADED:", {
          emergencies: result.emergencies.length,
          complaints: result.complaints.length,
        });
      }

      setLoading(false);
      setRefreshing(false);
    };

    loadGISData();

    return () => {
      controller.abort();
    };
  }, [fetchGISData, refreshKey]);

  /* =======================================================
     REFRESH MAP DATA
  ======================================================= */

  const refreshGISData = () => {
    setRefreshing(true);
    setError("");
    setRefreshKey((current) => current + 1);
  };

  /* =======================================================
     BUILD LOCATION RECORDS
  ======================================================= */

  const allLocations = useMemo(() => {
    const emergencyLocations = emergencies.map((item) => ({
      ...item,
      _gisType: "emergency",
      _gisCoordinates: getCoordinates(item),
      _gisTitle: getItemTitle(item, "emergency"),
      _gisLocation: getItemLocation(item),
      _gisStatus: getItemStatus(item),
    }));

    const complaintLocations = complaints.map((item) => ({
      ...item,
      _gisType: "complaint",
      _gisCoordinates: getCoordinates(item),
      _gisTitle: getItemTitle(item, "complaint"),
      _gisLocation: getItemLocation(item),
      _gisStatus: getItemStatus(item),
    }));

    return [...emergencyLocations, ...complaintLocations];
  }, [emergencies, complaints]);

  /* =======================================================
     SEARCH AND FILTER
  ======================================================= */

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allLocations.filter((item) => {
      const matchesLayer =
        layer === "all" ||
        item._gisType === LAYER_TYPES[layer];

      const searchableText = [
        item._gisTitle,
        item._gisLocation,
        item._gisStatus,
        item.department,
        item.citizenName,
        item.emergencyId,
        item.complaintId,
        item._id,
        item.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesLayer && matchesSearch;
    });
  }, [allLocations, layer, search]);

  const mappedLocations = useMemo(
    () =>
      filteredLocations.filter(
        (item) => item._gisCoordinates
      ),
    [filteredLocations]
  );

  /* =======================================================
     SUMMARY STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const activeEmergencies = emergencies.filter((item) => {
      const status = String(item.status || "")
        .trim()
        .toLowerCase();

      return ![
        "resolved",
        "cancelled",
        "closed",
        "completed",
      ].includes(status);
    });

    const openComplaints = complaints.filter((item) => {
      const status = String(item.status || "")
        .trim()
        .toLowerCase();

      return ![
        "resolved",
        "closed",
        "completed",
        "cancelled",
        "rejected",
      ].includes(status);
    });

    return {
      emergencies: emergencies.length,
      active: activeEmergencies.length,
      complaints: complaints.length,
      mapped: allLocations.filter(
        (item) => item._gisCoordinates
      ).length,
      openComplaints: openComplaints.length,
    };
  }, [emergencies, complaints, allLocations]);

  const mapCenter = useMemo(() => {
    if (mappedLocations.length > 0) {
      return mappedLocations[0]._gisCoordinates;
    }

    return DEFAULT_CENTER;
  }, [mappedLocations]);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setSearch("");
    setLayer("all");
    setSelectedItem(null);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="gis-dashboard">
      <header className="gis-heading">
        <div>
          <span className="gis-eyebrow">
            <Layers size={15} />
            SMARTCITY ADMINISTRATION
          </span>

          <h1>GIS Dashboard</h1>

          <p>
            Geographic view of emergency reports and citizen
            complaints. Monitor mapped incidents and their locations.
          </p>
        </div>

        <button
          type="button"
          className="gis-refresh-btn"
          onClick={refreshGISData}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "gis-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh Map Data"}
        </button>
      </header>

      {error && (
        <div className="gis-alert" role="alert">
          <AlertTriangle size={19} />

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

      {/* SUMMARY CARDS */}

      <section className="gis-stats-grid">
        <article className="gis-stat-card">
          <div className="gis-stat-icon gis-icon-red">
            <ShieldAlert size={23} />
          </div>

          <div>
            <span>Total Emergencies</span>
            <strong>{stats.emergencies}</strong>
            <small>Emergency reports received</small>
          </div>
        </article>

        <article className="gis-stat-card">
          <div className="gis-stat-icon gis-icon-orange">
            <Activity size={23} />
          </div>

          <div>
            <span>Active Emergencies</span>
            <strong>{stats.active}</strong>
            <small>Not resolved or cancelled</small>
          </div>
        </article>

        <article className="gis-stat-card">
          <div className="gis-stat-icon gis-icon-blue">
            <Clock size={23} />
          </div>

          <div>
            <span>Citizen Complaints</span>
            <strong>{stats.complaints}</strong>
            <small>{stats.openComplaints} still open</small>
          </div>
        </article>

        <article className="gis-stat-card">
          <div className="gis-stat-icon gis-icon-green">
            <MapPin size={23} />
          </div>

          <div>
            <span>Mapped Locations</span>
            <strong>{stats.mapped}</strong>
            <small>Records with valid coordinates</small>
          </div>
        </article>
      </section>

      {/* MAP */}

      <section className="gis-map-card">
        <div className="gis-map-header">
          <div>
            <h2>City Incident Map</h2>
            <p>Select a marker to view its report details.</p>
          </div>

          <span className="gis-live-label">
            <span />
            {loading ? "Loading data" : "Map data loaded"}
          </span>
        </div>

        <div className="gis-map-toolbar">
          <label className="gis-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search locations or incidents..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            value={layer}
            onChange={(event) => setLayer(event.target.value)}
            aria-label="Filter map layer"
          >
            {LAYER_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="gis-reset-btn"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

        <div className="gis-map-container">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={12}
            scrollWheelZoom
            zoomControl={false}
            className="gis-leaflet-map"
          >
            <MapRecenter center={mapCenter} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomControl position="bottomright" />

            {mappedLocations.map((item, index) => (
              <Marker
                key={`${item._gisType}-${getIdForGIS(item) || index}`}
                position={item._gisCoordinates}
                icon={createMarkerIcon(
                  item._gisType,
                  item._gisStatus
                )}
                eventHandlers={{
                  click: () => setSelectedItem(item),
                }}
              >
                <Popup>
                  <div className="gis-popup">
                    <strong>{item._gisTitle}</strong>
                    <span>{item._gisLocation}</span>

                    <small>
                      {item._gisType === "emergency"
                        ? "Emergency"
                        : "Complaint"}{" "}
                      · {item._gisStatus}
                    </small>

                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                    >
                      View details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {loading && (
            <div className="gis-map-loading">
              <RefreshCw className="gis-spin" size={23} />
              <span>Loading geographic data...</span>
            </div>
          )}

          {!loading &&
            !error &&
            mappedLocations.length === 0 && (
              <div className="gis-map-empty">
                <MapPin size={25} />

                <strong>No mapped locations found</strong>

                <p>
                  No records matching your filters contain valid
                  latitude and longitude coordinates.
                </p>
              </div>
            )}
        </div>

        <div className="gis-map-footer">
          <div className="gis-legend">
            <span>
              <i className="gis-legend-dot gis-dot-red" />
              Active emergencies
            </span>

            <span>
              <i className="gis-legend-dot gis-dot-orange" />
              Open complaints
            </span>

            <span>
              <i className="gis-legend-dot gis-dot-green" />
              Resolved or closed
            </span>
          </div>

          <span className="gis-map-total">
            {mappedLocations.length} mapped on this view
          </span>
        </div>
      </section>

      {/* LOCATION RECORDS */}

      <section className="gis-records-card">
        <div className="gis-records-heading">
          <div>
            <h2>Location Records</h2>
            <p>
              Reports matching your current search and layer filters.
            </p>
          </div>

          <span className="gis-record-count">
            {filteredLocations.length} records
          </span>
        </div>

        {loading ? (
          <div className="gis-empty-state">
            <RefreshCw className="gis-spin" size={25} />
            <strong>Loading records...</strong>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="gis-empty-state">
            <Search size={25} />
            <strong>No matching records</strong>
            <span>
              Try changing your search or layer selection.
            </span>
          </div>
        ) : (
          <div className="gis-record-list">
            {filteredLocations.slice(0, 10).map((item, index) => (
              <button
                type="button"
                className={`gis-record-row ${
                  selectedItem &&
                  getIdForGIS(selectedItem) === getIdForGIS(item) &&
                  selectedItem._gisType === item._gisType
                    ? "gis-record-selected"
                    : ""
                }`}
                key={`${item._gisType}-${getIdForGIS(item) || index}`}
                onClick={() => setSelectedItem(item)}
              >
                <span
                  className={`gis-record-icon ${
                    item._gisType === "emergency"
                      ? "gis-record-emergency"
                      : "gis-record-complaint"
                  }`}
                >
                  {item._gisType === "emergency" ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <MapPin size={18} />
                  )}
                </span>

                <span className="gis-record-main">
                  <strong>{item._gisTitle}</strong>
                  <small>{item._gisLocation}</small>

                  <small>
                    {getItemDate(item)} ·{" "}
                    {item._gisType === "emergency"
                      ? "Emergency"
                      : "Complaint"}
                  </small>
                </span>

                <span
                  className={`gis-record-status gis-status-${item._gisStatus
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {item._gisStatus}
                </span>

                <span className="gis-record-coordinate">
                  {item._gisCoordinates
                    ? `${item._gisCoordinates[0].toFixed(4)}, ${item._gisCoordinates[1].toFixed(4)}`
                    : "No coordinates"}
                </span>
              </button>
            ))}

            {filteredLocations.length > 10 && (
              <p className="gis-more-records">
                Showing 10 of {filteredLocations.length} matching
                records. Use the search box to narrow the list.
              </p>
            )}
          </div>
        )}
      </section>

      {/* SELECTED RECORD DETAILS */}

      {selectedItem && (
        <div
          className="gis-detail-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedItem(null);
            }
          }}
        >
          <section
            className="gis-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gis-detail-title"
          >
            <div className="gis-detail-header">
              <div>
                <span className="gis-eyebrow">
                  {selectedItem._gisType === "emergency"
                    ? "EMERGENCY REPORT"
                    : "CITIZEN COMPLAINT"}
                </span>

                <h2 id="gis-detail-title">
                  {selectedItem._gisTitle}
                </h2>
              </div>

              <button
                type="button"
                className="gis-close-btn"
                onClick={() => setSelectedItem(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="gis-detail-grid">
              <div>
                <span>Status</span>
                <strong>{selectedItem._gisStatus}</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>
                  {selectedItem.department || "Not specified"}
                </strong>
              </div>

              <div className="gis-detail-wide">
                <span>Location</span>
                <strong>{selectedItem._gisLocation}</strong>
              </div>

              <div>
                <span>Reported on</span>
                <strong>{getItemDate(selectedItem)}</strong>
              </div>

              <div>
                <span>Report ID</span>
                <strong>
                  {selectedItem.emergencyId ||
                    selectedItem.complaintId ||
                    selectedItem._id ||
                    "Not available"}
                </strong>
              </div>

              <div className="gis-detail-wide">
                <span>Description</span>
                <p>
                  {selectedItem.description ||
                    selectedItem.details ||
                    selectedItem.message ||
                    "No description provided."}
                </p>
              </div>

              <div className="gis-detail-wide">
                <span>Coordinates</span>
                <strong>
                  {selectedItem._gisCoordinates
                    ? selectedItem._gisCoordinates.join(", ")
                    : "No geographic coordinates stored for this report."}
                </strong>
              </div>
            </div>

            <div className="gis-detail-footer">
              <button
                type="button"
                className="gis-refresh-btn"
                onClick={() => setSelectedItem(null)}
              >
                <CheckCircle size={17} />
                Close details
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default GISDashboard;