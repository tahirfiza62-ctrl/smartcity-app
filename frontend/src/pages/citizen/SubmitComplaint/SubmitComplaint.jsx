
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ClipboardList,
  LoaderCircle,
  MapPin,
  Send,
  LocateFixed,
} from "lucide-react";
import "./SubmitComplaint.css";

const API_URL = "http://localhost:3000/api";

const EMPTY_FORM = {
  departmentId: "",
  subject: "",
  description: "",
  location: "",
  priority: "Medium",
  latitude: "",
  longitude: "",
};

const SubmitComplaint = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locationMessage, setLocationMessage] = useState("");


  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  /* =========================================================
     FETCH ACTIVE DEPARTMENTS

     This function returns data without updating React state.
  ========================================================= */

  const fetchDepartments = useCallback(async (signal) => {
    try {
      const response = await fetch(
        `${API_URL}/departments/active`,
        { signal }
      );

      const data = await response.json().catch(() => ({}));

      if (signal?.aborted) {
        return null;
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to load departments."
        );
      }

      const departmentList = Array.isArray(data)
        ? data
        : Array.isArray(data.departments)
          ? data.departments
          : Array.isArray(data.data)
            ? data.data
            : [];

      const activeDepartments = departmentList.filter(
        (department) =>
          String(department.status || "Active").toLowerCase() ===
          "active"
      );

      return {
        departments: activeDepartments,
        error: "",
      };
    } catch (err) {
      if (err.name === "AbortError" || signal?.aborted) {
        return null;
      }

      console.error("FETCH DEPARTMENTS ERROR:", err);

      return {
        departments: null,
        error: err.message || "Could not connect to the server.",
      };
    }
  }, []);

  /* =========================================================
     LOAD DEPARTMENTS

     React state is updated after the asynchronous request.
  ========================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const loadDepartments = async () => {
      const result = await fetchDepartments(controller.signal);

      if (!result || controller.signal.aborted) {
        return;
      }

      if (result.error) {
        setError(result.error);
      } else {
        setDepartments(result.departments);
        setError("");

        setFormData((previous) => ({
          ...previous,
          departmentId: result.departments.some(
            (department) =>
              String(department._id) === previous.departmentId
          )
            ? previous.departmentId
            : "",
        }));
      }

      setLoadingDepartments(false);
    };

    loadDepartments();

    return () => {
      controller.abort();
    };
}, [fetchDepartments]);

  /* =========================================================
     RETRY LOADING DEPARTMENTS
  ========================================================= */

  const handleRetryDepartments = async () => {
    setLoadingDepartments(true);
    setError("");

    const result = await fetchDepartments();

    if (!result) {
      setLoadingDepartments(false);
      return;
    }

    if (result.error) {
      setError(result.error);
    } else {
      setDepartments(result.departments);

      setFormData((previous) => ({
        ...previous,
        departmentId: result.departments.some(
          (department) =>
            String(department._id) === previous.departmentId
        )
          ? previous.departmentId
          : "",
      }));
    }

    setLoadingDepartments(false);
  };

  /* =========================================================
     UPDATE FORM FIELDS
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     GET CITIZEN'S CURRENT GPS LOCATION
  ========================================================= */

  const getCurrentLocation = () => {
    setError("");
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setFormData((previous) => ({
          ...previous,
          latitude: String(latitude),
          longitude: String(longitude),
        }));

        setLocationMessage(
          "GPS coordinates captured successfully."
        );

        setGettingLocation(false);
      },
      (geoError) => {
        let message = "Unable to get your location.";

        if (geoError.code === 1) {
          message =
            "Location permission was denied. Allow location access in your browser settings and try again.";
        } else if (geoError.code === 2) {
          message =
            "Your current location is unavailable. Please try again.";
        } else if (geoError.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        setLocationMessage(message);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /* =========================================================
     SUBMIT COMPLAINT WITH GPS COORDINATES
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("smartcity_token");

    if (!token) {
      setError("Please log in before submitting a complaint.");
      return;
    }

    if (!formData.departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!formData.subject.trim()) {
      setError("Please enter a complaint subject.");
      return;
    }

    if (formData.subject.trim().length < 5) {
      setError("Subject must contain at least 5 characters.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please describe your complaint.");
      return;
    }

    if (formData.description.trim().length < 10) {
      setError("Description must contain at least 10 characters.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter the complaint location.");
      return;
    }

    // GPS coordinates are required for the GIS Dashboard.
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (
      formData.latitude === "" ||
      formData.longitude === "" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180 ||
      (latitude === 0 && longitude === 0)
    ) {
      setError(
        'Please click "Use My Current Location" to capture valid GPS coordinates for the GIS Dashboard.'
      );
      return;
    }

    const selectedDepartment = departments.find(
      (department) =>
        String(department._id) === formData.departmentId
    );

    if (!selectedDepartment) {
      setError(
        "The selected department is no longer available. Please select another."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          departmentId: selectedDepartment._id,
          category: selectedDepartment.name,
          department: selectedDepartment.name,
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          priority: formData.priority,
          latitude,
          longitude,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        setError(
          "Your session may have expired. Please log in again."
        );
        return;
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to submit your complaint."
        );
      }

      setSuccess(
        data.message ||
          "Your complaint has been submitted successfully!"
      );

      const complaintId =
        data.complaint?._id ||
        data.data?.complaint?._id ||
        data.data?._id;

      setFormData({ ...EMPTY_FORM });
      setLocationMessage("");

      if (complaintId) {
        window.setTimeout(() => {
          navigate("/my-complaints");
        }, 1800);
      }
    } catch (err) {
      console.error("SUBMIT COMPLAINT ERROR:", err);

      setError(
        err.message ||
          "Unable to submit your complaint. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="submit-complaint-page">
      <div className="submit-complaint-container">
        <button
          type="button"
          className="complaint-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span>Go Back</span>
        </button>

        <div className="complaint-page-heading">
          <div className="complaint-heading-icon">
            <ClipboardList size={28} />
          </div>

          <div>
            <h1>Submit a Complaint</h1>
            <p>
              Report an issue in your area and help improve your
              community.
            </p>
          </div>
        </div>

        <div className="complaint-form-card">
          <div className="complaint-form-heading">
            <h2>Complaint Details</h2>
            <p>
              Provide accurate information and GPS coordinates so
              the relevant department can locate the issue.
            </p>
          </div>

          {error && (
            <div
              className="complaint-alert complaint-alert-error"
              role="alert"
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="complaint-alert complaint-alert-success"
              role="status"
            >
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* DEPARTMENT */}

            <div className="complaint-form-group">
              <label htmlFor="departmentId">
                Department <span>*</span>
              </label>

              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={loadingDepartments || submitting}
                required
              >
                <option value="">
                  {loadingDepartments
                    ? "Loading departments..."
                    : "Select a department"}
                </option>

                {departments.map((department) => (
                  <option
                    key={department._id}
                    value={department._id}
                  >
                    {department.name}
                  </option>
                ))}
              </select>

              {loadingDepartments && (
                <small className="complaint-field-note">
                  <LoaderCircle
                    size={14}
                    className="complaint-spinner"
                  />
                  Loading available departments...
                </small>
              )}

              {!loadingDepartments &&
                !error &&
                departments.length === 0 && (
                  <small className="complaint-field-note">
                    No active departments are available.{" "}
                    <button
                      type="button"
                      className="complaint-inline-button"
                      onClick={handleRetryDepartments}
                    >
                      Try again
                    </button>
                  </small>
                )}
            </div>

            {/* SUBJECT */}

            <div className="complaint-form-group">
              <label htmlFor="subject">
                Complaint Subject <span>*</span>
              </label>

              <input
                id="subject"
                type="text"
                name="subject"
                placeholder="e.g. Street light not working"
                value={formData.subject}
                onChange={handleChange}
                maxLength={150}
                disabled={submitting}
                required
              />

              <small className="complaint-character-count">
                {formData.subject.length}/150 characters
              </small>
            </div>

            {/* DESCRIPTION */}

            <div className="complaint-form-group">
              <label htmlFor="description">
                Description <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Explain the problem and provide useful details..."
                value={formData.description}
                onChange={handleChange}
                rows={5}
                maxLength={2000}
                disabled={submitting}
                required
              />

              <small className="complaint-character-count">
                {formData.description.length}/2000 characters
              </small>
            </div>

            {/* ADDRESS */}

            <div className="complaint-form-group">
              <label htmlFor="location">
                Complaint Address / Area <span>*</span>
              </label>

              <div className="complaint-input-with-icon">
                <MapPin size={19} />

                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="Street, sector, area, or nearby landmark"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength={250}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {/* GPS COORDINATES */}

            <div className="complaint-form-group complaint-gps-group">
              <label>
                Geographical Location <span>*</span>
              </label>

              <p className="complaint-gps-description">
                Capture the location coordinates to place this
                complaint on the SmartCity GIS Dashboard.
              </p>

              <button
                type="button"
                className="complaint-gps-button"
                onClick={getCurrentLocation}
                disabled={gettingLocation || submitting}
              >
                {gettingLocation ? (
                  <LoaderCircle
                    size={18}
                    className="complaint-spinner"
                  />
                ) : (
                  <LocateFixed size={18} />
                )}

                {gettingLocation
                  ? "Getting your location..."
                  : formData.latitude
                    ? "Refresh My Current Location"
                    : "Use My Current Location"}
              </button>

              {locationMessage && (
                <p
                  className={`complaint-location-message ${
                    formData.latitude
                      ? "complaint-location-success"
                      : "complaint-location-error"
                  }`}
                  role="status"
                >
                  {formData.latitude ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}

                  {locationMessage}
                </p>
              )}

              {formData.latitude !== "" &&
                formData.longitude !== "" && (
                  <div className="complaint-coordinates">
                    <div>
                      <span>Latitude</span>
                      <strong>{formData.latitude}</strong>
                    </div>

                    <div>
                      <span>Longitude</span>
                      <strong>{formData.longitude}</strong>
                    </div>

                    <a
                      href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="complaint-view-map-link"
                    >
                      <MapPin size={15} />
                      View on Map
                    </a>
                  </div>
                )}
            </div>

            {/* PRIORITY */}

            <div className="complaint-form-group">
              <label htmlFor="priority">Priority Level</label>

              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <small className="complaint-field-note">
                Choose the level that best describes the urgency.
              </small>
            </div>

            {/* FORM ACTIONS */}

            <div className="complaint-form-actions">
              <button
                type="button"
                className="complaint-cancel-button"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="complaint-submit-button"
                disabled={
                  submitting ||
                  loadingDepartments ||
                  departments.length === 0
                }
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="complaint-spinner"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="complaint-required-note">
          <span>*</span> Required fields
        </p>
      </div>
    </div>
  );
};

export default SubmitComplaint;