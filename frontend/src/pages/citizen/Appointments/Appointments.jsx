
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  Building2,
  FileText,
  Send,
} from "lucide-react";

import "./Appointments.css";

const Appointment = () => {
  const [department, setDepartment] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // BOOK APPOINTMENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Get logged-in user's token
      const token = localStorage.getItem("smartcity_token");

      console.log("Token before appointment:", token);

      // Check token
      if (!token) {
        toast.error("Please login first.");
        return;
      }

      // Data being sent to backend
      const appointmentData = {
        department,
        appointmentDate,
        appointmentTime,
        purpose,
      };

      console.log(
        "Appointment Data:",
        appointmentData
      );

      // Send appointment with JWT token
      const response = await axios.post(
        "http://localhost:3000/api/appointments",
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Appointment Response:",
        response.data
      );

      // Success message
      toast.success(
        response.data.message ||
          "Appointment booked successfully."
      );

      // Clear form
      setDepartment("");
      setAppointmentDate("");
      setAppointmentTime("");
      setPurpose("");

    } catch (error) {
      console.error(
        "Appointment Error:",
        error
      );

      if (error.response?.status === 401) {
        toast.error(
          error.response?.data?.message ||
            "Session expired. Please login again."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to book appointment."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="appointment-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="appointment-page-header">

        <div className="appointment-header-content">

          <p className="appointment-eyebrow">
            CITIZEN SERVICES
          </p>

          <h1>
            Book an Appointment
          </h1>

          <p>
            Schedule an appointment with the relevant
            government department or city service.
          </p>

        </div>


        <div className="appointment-header-icon">
          <CalendarDays size={36} />
        </div>

      </div>


      {/* =================================================
          FORM CARD
      ================================================= */}

      <div className="appointment-form-card">

        <div className="appointment-form-heading">

          <div className="appointment-heading-icon">
            <CalendarDays size={22} />
          </div>

          <div>

            <h2>
              Appointment Details
            </h2>

            <p>
              Please provide the details for your
              appointment.
            </p>

          </div>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* ================= DEPARTMENT ================= */}

          <div className="appointment-form-group">

            <label>
              Department <span>*</span>
            </label>

            <div className="appointment-input-wrapper">

              <Building2 size={18} />

              <select
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                required
              >

                <option value="">
                  Select department
                </option>

                <option value="Municipal Services">
                  Municipal Services
                </option>

                <option value="Water & Sewerage">
                  Water & Sewerage
                </option>

                <option value="Traffic Management">
                  Traffic Management
                </option>

                <option value="Waste Management">
                  Waste Management
                </option>

                <option value="Building Control">
                  Building Control
                </option>

                <option value="Public Transport">
                  Public Transport
                </option>

                <option value="Citizen Facilitation">
                  Citizen Facilitation
                </option>

              </select>

            </div>

          </div>


          {/* ================= DATE & TIME ================= */}

          <div className="appointment-row">

            {/* DATE */}

            <div className="appointment-form-group">

              <label>
                Appointment Date <span>*</span>
              </label>

              <div className="appointment-input-wrapper">

                <CalendarDays size={18} />

                <input
                  type="date"
                  value={appointmentDate}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setAppointmentDate(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>


            {/* TIME */}

            <div className="appointment-form-group">

              <label>
                Appointment Time <span>*</span>
              </label>

              <div className="appointment-input-wrapper">

                <Clock size={18} />

                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) =>
                    setAppointmentTime(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>

          </div>


          {/* ================= PURPOSE ================= */}

          <div className="appointment-form-group">

            <label>
              Purpose of Appointment <span>*</span>
            </label>

            <div className="appointment-textarea-wrapper">

              <FileText size={18} />

              <textarea
                rows="6"
                placeholder="Explain the purpose of your appointment..."
                value={purpose}
                onChange={(e) =>
                  setPurpose(e.target.value)
                }
                required
              />

            </div>

          </div>


          {/* ================= INFORMATION ================= */}

          <div className="appointment-info-box">

            <CalendarDays size={19} />

            <p>
              Please arrive a few minutes before your
              scheduled appointment time. Make sure to
              bring any required documents with you.
            </p>

          </div>


          {/* ================= ACTIONS ================= */}

          <div className="appointment-form-actions">

            <Link
              to="/citizen"
              className="appointment-cancel-btn"
            >
              Cancel
            </Link>


            <button
              type="submit"
              className="appointment-submit-btn"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="appointment-spinner"></span>
                  Booking...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Book Appointment
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default Appointment;

