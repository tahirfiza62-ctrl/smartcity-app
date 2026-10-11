
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Clock3,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Plus,
  MessageSquare,
} from "lucide-react";

import "./CitizenDashboard.css";

const API_URL = "http://localhost:3000/api/citizen/dashboard";

/* =========================================================
   CITIZEN DASHBOARD
========================================================= */

const CitizenDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  /* =========================================================
     FETCH DASHBOARD

     This function only requests and returns the data.
     It does not directly update React state.
  ========================================================= */

  const fetchDashboard = useCallback(async (signal) => {
    try {
      const token = localStorage.getItem("smartcity_token");

      console.log("SMARTCITY TOKEN EXISTS:", Boolean(token));

      if (!token) {
        return {
          data: null,
          error: "Authentication required. Please login again.",
          unauthorized: false,
        };
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (signal?.aborted) {
        return null;
      }

      console.log("DASHBOARD RESPONSE:", response.data);

      if (response.data?.success) {
        return {
          data: response.data,
          error: "",
          unauthorized: false,
        };
      }

      return {
        data: null,
        error:
          response.data?.message ||
          "Unable to load dashboard data.",
        unauthorized: false,
      };
    } catch (err) {
      if (
        signal?.aborted ||
        axios.isCancel(err) ||
        err.code === "ERR_CANCELED"
      ) {
        return null;
      }

      console.error(
        "CITIZEN DASHBOARD ERROR:",
        err.response?.data || err
      );

      const status = err.response?.status;
      const message = err.response?.data?.message;

      let errorMessage;

      if (status === 401) {
        errorMessage =
          message ||
          "Authentication failed. Please login again.";
      } else if (status === 403) {
        errorMessage =
          message ||
          "Your account does not have access to this dashboard.";
      } else if (status === 404) {
        errorMessage =
          "Citizen dashboard API route was not found.";
      } else if (status >= 500) {
        errorMessage =
          message ||
          "Server error. Please try again later.";
      } else {
        errorMessage =
          message ||
          "Unable to connect to the SmartCity server.";
      }

      return {
        data: null,
        error: errorMessage,
        unauthorized: status === 401,
      };
    }
  }, []);

  /* =========================================================
     LOAD DASHBOARD

     State updates happen after the awaited request completes.
     Requests are cancelled when the component unmounts.
  ========================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      const result = await fetchDashboard(controller.signal);

      if (!result || controller.signal.aborted) {
        return;
      }

      if (result.unauthorized) {
        localStorage.removeItem("smartcity_token");
        localStorage.removeItem("smartcity_user");
      }

      if (result.error) {
        setError(result.error);
      } else {
        setDashboard(result.data);
        setError("");
      }

      setLoading(false);
    };

    loadDashboard();

    return () => {
      controller.abort();
    };
  }, [fetchDashboard, refreshKey]);

  /* =========================================================
     RETRY / REFRESH
  ========================================================= */

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setRefreshKey((current) => current + 1);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="citizen-dashboard-loading">
        <div className="loading-spinner"></div>

        <h2>Loading Citizen Dashboard</h2>

        <p>
          Please wait while we securely load your information.
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="citizen-dashboard-error">
        <div className="dashboard-error-card">
          <div className="error-icon">
            <AlertCircle size={42} />
          </div>

          <h2>Dashboard Unavailable</h2>

          <p>{error}</p>

          <div className="error-actions">
            <button
              type="button"
              className="dashboard-retry-btn"
              onClick={handleRetry}
            >
              <RefreshCw size={18} />
              Try Again
            </button>

            <Link
              to="/login"
              className="dashboard-login-btn"
            >
              Login Again
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  const user = dashboard?.user || {};

  const statistics = dashboard?.statistics || {
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalServiceRequests: 0,
  };

  const recentComplaints = Array.isArray(
    dashboard?.recentComplaints
  )
    ? dashboard.recentComplaints
    : [];

  const serviceRequests = Array.isArray(
    dashboard?.serviceRequests
  )
    ? dashboard.serviceRequests
    : [];

  const appointments = Array.isArray(dashboard?.appointments)
    ? dashboard.appointments
    : [];

  const notifications = Array.isArray(
    dashboard?.notifications
  )
    ? dashboard.notifications
    : [];

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("smartcity_token");
    localStorage.removeItem("smartcity_user");

    toast.success("Logged out successfully.");

    window.location.href = "/login";
  };

  /* =========================================================
     ANIMATION
  ========================================================= */

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 25,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "Recently submitted";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently submitted";
    }

    return parsedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     DASHBOARD
  ========================================================= */

  return (
    <div className="citizen-dashboard">
      <section className="citizen-content">
        {/* WELCOME */}

        <motion.div
          className="dashboard-welcome"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="welcome-content">
            <p className="welcome-label">CITIZEN PORTAL</p>

            <h1>
              Welcome{" "}
              <span>{user.fullName || "Citizen"}</span>
            </h1>

            <p>
              Stay connected with your city. Manage your complaints,
              services and appointments from one place.
            </p>

            <div className="welcome-actions">
              <Link
                to="/citizen/submit-complaint"
                className="welcome-primary-btn"
              >
                <Plus size={17} />
                Submit Complaint
              </Link>

              <Link
                to="/citizen/services"
                className="welcome-secondary-btn"
              >
                Explore Services
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="welcome-icon">
            <ShieldCheck size={58} />
          </div>
        </motion.div>

        {/* QUICK ACTIONS */}

        <motion.section
          className="quick-actions-section"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="section-heading">
            <p>QUICK ACCESS</p>
            <h2>What would you like to do?</h2>
          </div>

          <div className="quick-actions-grid">
            <Link
              to="/citizen/submit-complaint"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                <MessageSquare size={24} />
              </div>

              <div>
                <h3>Submit Complaint</h3>
                <p>Report an issue in your area</p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/citizen/services"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                <ClipboardList size={24} />
              </div>

              <div>
                <h3>City Services</h3>
                <p>Explore available services</p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/citizen/appointments"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                <CalendarDays size={24} />
              </div>

              <div>
                <h3>Appointments</h3>
                <p>Manage your appointments</p>
              </div>

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/citizen/notifications"
              className="quick-action-card"
            >
              <div className="quick-action-icon">
                <Bell size={24} />
              </div>

              <div>
                <h3>Notifications</h3>
                <p>View your latest updates</p>
              </div>

              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.section>

        {/* STATISTICS */}

        <motion.section
          className="dashboard-stats"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={23} />
            </div>

            <div>
              <span>Total Complaints</span>
              <strong>{statistics.totalComplaints || 0}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock3 size={23} />
            </div>

            <div>
              <span>Pending Complaints</span>
              <strong>{statistics.pendingComplaints || 0}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <span>Resolved Complaints</span>
              <strong>{statistics.resolvedComplaints || 0}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ClipboardList size={23} />
            </div>

            <div>
              <span>Service Requests</span>
              <strong>{statistics.totalServiceRequests || 0}</strong>
            </div>
          </div>
        </motion.section>

        {/* RECENT COMPLAINTS AND SERVICE REQUESTS */}

        <div className="dashboard-columns">
          <motion.section
            className="dashboard-panel"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="panel-header">
              <div>
                <p>ACTIVITY</p>
                <h2>Recent Complaints</h2>
              </div>

              <Link to="/citizen/submit-complaint">
                <Plus size={16} />
                New
              </Link>
            </div>

            {recentComplaints.length > 0 ? (
              <div className="complaints-list">
                {recentComplaints.map((complaint, index) => {
                  const status = String(
                    complaint.status || "Pending"
                  );

                  return (
                    <div
                      className="complaint-item"
                      key={
                        complaint._id ||
                        complaint.id ||
                        index
                      }
                    >
                      <div className="complaint-icon">
                        <MessageSquare size={18} />
                      </div>

                      <div className="complaint-info">
                        <h3>
                          {complaint.title ||
                            complaint.subject ||
                            "Complaint"}
                        </h3>

                        <span>
                          {formatDate(complaint.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`complaint-status ${status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <FileText size={25} />
                </div>

                <h3>No complaints yet</h3>

                <p>You haven't submitted any complaints.</p>

                <Link to="/citizen/submit-complaint">
                  Submit a Complaint
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.section>

          <motion.section
            className="dashboard-panel"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="panel-header">
              <div>
                <p>SERVICES</p>
                <h2>Service Requests</h2>
              </div>

              <Link to="/citizen/services">
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {serviceRequests.length > 0 ? (
              <div className="service-list">
                {serviceRequests.map((service, index) => {
                  const status = String(
                    service.status || "Submitted"
                  );

                  return (
                    <Link
                      to="/citizen/services"
                      className="service-item"
                      key={service._id || service.id || index}
                    >
                      <div className="service-icon">
                        <ClipboardList size={18} />
                      </div>

                      <div className="service-info">
                        <h3>
                          {service.serviceName ||
                            service.title ||
                            service.name ||
                            "Service Request"}
                        </h3>

                        <span>
                          {service.requestId || "Service Request"}
                          {" • "}
                          {formatDate(service.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`service-status ${status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <ClipboardList size={25} />
                </div>

                <h3>No service requests</h3>

                <p>
                  Your submitted service applications will appear here.
                </p>

                <Link to="/citizen/services">
                  Explore Services
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.section>
        </div>

        {/* APPOINTMENTS AND NOTIFICATIONS */}

        <div className="dashboard-columns">
          <motion.section
            className="dashboard-panel"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="panel-header">
              <div>
                <p>SCHEDULE</p>
                <h2>Upcoming Appointments</h2>
              </div>

              <Link to="/citizen/appointments">
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {appointments.length > 0 ? (
              <div className="appointment-list">
                {appointments.map((appointment, index) => (
                  <div
                    className="appointment-item"
                    key={
                      appointment._id ||
                      appointment.id ||
                      index
                    }
                  >
                    <div className="appointment-date">
                      <CalendarDays size={19} />
                      <span>{appointment.date || "Date"}</span>
                    </div>

                    <div>
                      <h3>
                        {appointment.title ||
                          appointment.service ||
                          "Appointment"}
                      </h3>

                      <p>
                        {appointment.time || "Time not specified"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <CalendarDays size={25} />
                </div>

                <h3>No upcoming appointments</h3>

                <p>Your scheduled appointments will appear here.</p>

                <Link to="/citizen/appointments">
                  Book Appointment
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.section>

          <motion.section
            className="dashboard-panel"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="panel-header">
              <div>
                <p>UPDATES</p>
                <h2>Notifications</h2>
              </div>

              <Link to="/citizen/notifications">
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {notifications.length > 0 ? (
              <div className="notification-list">
                {notifications.map((notification, index) => (
                  <div
                    className="notification-item"
                    key={
                      notification._id ||
                      notification.id ||
                      index
                    }
                  >
                    <div className="notification-icon">
                      <Bell size={18} />
                    </div>

                    <div>
                      <h3>
                        {notification.title || "Notification"}
                      </h3>

                      <p>
                        {notification.message ||
                          notification.text ||
                          ""}
                      </p>

                      <span>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Bell size={25} />
                </div>

                <h3>No new notifications</h3>

                <p>You're all caught up.</p>
              </div>
            )}
          </motion.section>
        </div>

        {/* SMART CITY SERVICES BANNER */}

        <motion.section
          className="city-service-banner"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="banner-icon">
            <ShieldCheck size={31} />
          </div>

          <div className="banner-content">
            <p>SMART CITY SERVICES</p>

            <h2>
              Everything you need,
              <br />
              connected in one place.
            </h2>

            <span>
              Access digital government services and stay connected
              with your city.
            </span>
          </div>

          <Link
            to="/citizen/services"
            className="banner-button"
          >
            Explore Services
            <ArrowRight size={18} />
          </Link>
        </motion.section>

        {/* FOOTER */}

        <footer className="citizen-footer">
          <span>
            © 2026 Smart City Digital Governance Platform
          </span>

          <span>
            <ShieldCheck size={14} />
            Secure Citizen Portal
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="footer-logout"
          >
            Logout
          </button>
        </footer>
      </section>
    </div>
  );
};

export default CitizenDashboard;