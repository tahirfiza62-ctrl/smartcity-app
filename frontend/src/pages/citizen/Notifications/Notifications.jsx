import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  CreditCard,
  CalendarDays,
  FileWarning,
  ClipboardList,
  Megaphone,
  RefreshCw,
  BellRing,
} from "lucide-react";

import "./Notifications.css";

const API_URL = "http://localhost:3000/api/notifications";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const token = localStorage.getItem("smartcity_token");

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // ==========================================
  // FETCH REAL NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      if (!token) {
        toast.error("Please login to view notifications.");
        return;
      }

      const response = await axios.get(
        API_URL,
        getAuthConfig()
      );

      if (response.data.success) {
        setNotifications(
          response.data.notifications || []
        );
      }

    } catch (error) {
      console.error(
        "Fetch Notifications Error:",
        error
      );

      if (error.response?.status === 401) {
        toast.error(
          "Your session has expired. Please login again."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to load notifications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==========================================
  // MARK ONE AS READ
  // ==========================================

  const markAsRead = async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${id}/read`,
        {},
        getAuthConfig()
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === id
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification
          )
        );
      }

    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update notification."
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);

      const response = await axios.patch(
        `${API_URL}/read-all`,
        {},
        getAuthConfig()
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );

        toast.success(
          "All notifications marked as read."
        );
      }

    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to mark notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const deleteNotification = async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              notification._id !== id
          )
        );

        toast.success(
          "Notification deleted."
        );
      }

    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete notification."
      );
    }
  };

  // ==========================================
  // ICON BASED ON NOTIFICATION TYPE
  // ==========================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Payment":
        return <CreditCard size={21} />;

      case "Appointment":
        return <CalendarDays size={21} />;

      case "Complaint":
        return <FileWarning size={21} />;

      case "Service Request":
        return <ClipboardList size={21} />;

      case "Announcement":
        return <Megaphone size={21} />;

      default:
        return <Bell size={21} />;
    }
  };

  // ==========================================
  // ICON CLASS
  // ==========================================

  const getNotificationClass = (type) => {
    switch (type) {
      case "Payment":
        return "notification-icon payment";

      case "Appointment":
        return "notification-icon appointment";

      case "Complaint":
        return "notification-icon complaint";

      case "Service Request":
        return "notification-icon service";

      case "Announcement":
        return "notification-icon announcement";

      default:
        return "notification-icon default";
    }
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    if (days < 7) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return notificationDate.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.isRead
  ).length;

  return (
    <div className="notifications-page">

      {/* ======================================
          HEADER
      ======================================= */}

      <div className="notifications-page-header">

        <div className="notifications-header-content">

          <p className="notifications-eyebrow">
            CITIZEN SERVICES
          </p>

          <h1>Notifications</h1>

          <p>
            Stay updated with your appointments,
            payments, complaints and service requests.
          </p>

        </div>

        <div className="notifications-header-icon">
          <BellRing size={36} />
        </div>

      </div>


      {/* ======================================
          BACK BUTTON
      ======================================= */}

      <Link
        to="/citizen/CitizenDashboard"
        className="notifications-back-btn"
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </Link>


      {/* ======================================
          NOTIFICATION CARD
      ======================================= */}

      <div className="notifications-card">

        <div className="notifications-card-header">

          <div className="notifications-heading">

            <div className="notifications-heading-icon">
              <Bell size={21} />
            </div>

            <div>
              <h2>Your Notifications</h2>

              <p>
                {notifications.length === 0
                  ? "No notifications yet."
                  : `${notifications.length} ${
                      notifications.length === 1
                        ? "notification"
                        : "notifications"
                    }`}
              </p>
            </div>

          </div>


          <div className="notifications-actions">

            {unreadCount > 0 && (
              <span className="unread-counter">
                {unreadCount} unread
              </span>
            )}

            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={markAllAsRead}
                disabled={markingAll}
              >
                <CheckCheck size={17} />

                {markingAll
                  ? "Updating..."
                  : "Mark all as read"}
              </button>
            )}

            <button
              className="refresh-notifications-btn"
              onClick={fetchNotifications}
              title="Refresh notifications"
            >
              <RefreshCw size={17} />
            </button>

          </div>

        </div>


        {/* ======================================
            LOADING
        ======================================= */}

        {loading ? (
          <div className="notifications-loading">

            <div className="notification-loader"></div>

            <p>
              Loading your notifications...
            </p>

          </div>
        ) : notifications.length === 0 ? (

          /* ====================================
             EMPTY STATE
          ==================================== */

          <div className="notifications-empty">

            <div className="empty-notification-icon">
              <Bell size={42} />
            </div>

            <h3>No notifications yet</h3>

            <p>
              Notifications will appear here when
              you book an appointment, make a payment,
              submit a complaint or use a city service.
            </p>

            <Link
              to="/citizen"
              className="empty-back-btn"
            >
              Go to Dashboard
            </Link>

          </div>

        ) : (

          /* ====================================
             REAL NOTIFICATIONS
          ==================================== */

          <div className="notifications-list">

            {notifications.map((notification) => (

              <div
                key={notification._id}
                className={`notification-item ${
                  notification.isRead
                    ? "read"
                    : "unread"
                }`}
              >

                {/* ICON */}

                <div
                  className={getNotificationClass(
                    notification.type
                  )}
                >
                  {getNotificationIcon(
                    notification.type
                  )}
                </div>


                {/* CONTENT */}

                <div className="notification-content">

                  <div className="notification-top-row">

                    <div className="notification-title-wrapper">

                      <h3>
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <span className="unread-dot"></span>
                      )}

                    </div>

                    <span className="notification-time">
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>

                  </div>


                  <p className="notification-message">
                    {notification.message}
                  </p>


                  <div className="notification-bottom-row">

                    <span className="notification-type">
                      {notification.type}
                    </span>

                    {!notification.isRead && (
                      <button
                        className="notification-read-btn"
                        onClick={() =>
                          markAsRead(
                            notification._id
                          )
                        }
                      >
                        <CheckCheck size={15} />
                        Mark as read
                      </button>
                    )}

                    <button
                      className="notification-delete-btn"
                      onClick={() =>
                        deleteNotification(
                          notification._id
                        )
                      }
                      title="Delete notification"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Notifications;