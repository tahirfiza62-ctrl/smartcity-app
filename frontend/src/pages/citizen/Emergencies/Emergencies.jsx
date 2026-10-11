import { useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  MapPin,
  Send,
  ShieldAlert,
} from "lucide-react";
import "./Emergencies.css";

const API_URL = "http://localhost:3000";

const Emergencies = () => {
  const [form, setForm] = useState({
    title: "",
    type: "Medical Emergency",
    location: "",
    severity: "Medium",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("smartcity_token");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_URL}/api/emergencies/report`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        `Emergency reported successfully. Your Emergency ID is ${response.data.emergency.emergencyId}`
      );

      setForm({
        title: "",
        type: "Medical Emergency",
        location: "",
        severity: "Medium",
        description: "",
      });
    } catch (err) {
      console.error("Emergency report error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to report emergency. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="citizen-emergency-page">

      {/* HEADER */}

      <div className="citizen-emergency-hero">

        <div className="citizen-emergency-icon">
          <ShieldAlert size={30} />
        </div>

        <div>
          <span className="citizen-emergency-eyebrow">
            CITIZEN SAFETY
          </span>

          <h1>Report an Emergency</h1>

          <p>
            Report an emergency in your area. Your report
            will automatically be forwarded to the
            appropriate department.
          </p>
        </div>

      </div>

      {/* CONTENT */}

      <div className="citizen-emergency-layout">

        {/* FORM */}

        <div className="citizen-emergency-card">

          <div className="citizen-emergency-card-header">
            <div>
              <h2>Emergency Details</h2>
              <p>
                Provide accurate information so the
                department can respond appropriately.
              </p>
            </div>
          </div>

          {success && (
            <div className="emergency-success">
              <AlertTriangle size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="emergency-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* TITLE */}

            <div className="citizen-form-group full">
              <label>Emergency Title</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Medical assistance required"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* TYPE */}

            <div className="citizen-form-grid">

              <div className="citizen-form-group">
                <label>Emergency Type</label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option>
                    Medical Emergency
                  </option>

                  <option>
                    Fire Emergency
                  </option>

                  <option>
                    Traffic Accident
                  </option>

                  <option>
                    Public Safety
                  </option>

                  <option>
                    Water Emergency
                  </option>

                  <option>
                    Sewerage Emergency
                  </option>

                  <option>
                    Infrastructure Failure
                  </option>

                  <option>
                    Other
                  </option>
                </select>
              </div>

              {/* SEVERITY */}

              <div className="citizen-form-group">
                <label>Severity</label>

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

            </div>

            {/* LOCATION */}

            <div className="citizen-form-group full">
              <label>Location</label>

              <div className="input-with-icon">
                <MapPin size={18} />

                <input
                  type="text"
                  name="location"
                  placeholder="Enter the emergency location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="citizen-form-group full">
              <label>Description</label>

              <textarea
                name="description"
                placeholder="Briefly describe what happened..."
                value={form.description}
                onChange={handleChange}
                rows="6"
                required
              />
            </div>

            {/* INFO */}

            <div className="emergency-routing-info">
              <AlertTriangle size={18} />

              <div>
                <strong>Automatic Department Assignment</strong>

                <p>
                  You do not need to select a department.
                  CIVIC CONNECT will automatically forward
                  your report to the appropriate department
                  based on the emergency type.
                </p>
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="citizen-emergency-submit"
              disabled={loading}
            >
              <Send size={18} />

              {loading
                ? "Submitting..."
                : "Submit Emergency Report"}
            </button>

          </form>

        </div>

        {/* SIDE INFORMATION */}

        <div className="citizen-emergency-side">

          <div className="emergency-side-card">

            <div className="side-icon">
              <AlertTriangle size={21} />
            </div>

            <h3>Emergency Reporting</h3>

            <p>
              Use this form to notify the relevant city
              department about an emergency situation.
            </p>

          </div>

          <div className="emergency-side-card">

            <h3>How it works</h3>

            <div className="emergency-step">
              <span>01</span>
              <p>Submit emergency details.</p>
            </div>

            <div className="emergency-step">
              <span>02</span>
              <p>The system assigns the department.</p>
            </div>

            <div className="emergency-step">
              <span>03</span>
              <p>The department receives the report.</p>
            </div>

            <div className="emergency-step">
              <span>04</span>
              <p>The department manages the response.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Emergencies;