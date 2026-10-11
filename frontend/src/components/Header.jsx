
import { useMemo, useState } from "react";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Header.css";

const DashboardHeader = ({
  mobileOpen = false,
  setMobileOpen,
  onMenuClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  /* =====================================================
     DETERMINE CURRENT PORTAL
  ===================================================== */

  const isDepartment = location.pathname.startsWith("/department");
  const isAdmin = location.pathname.startsWith("/admin");

  const portalName = isDepartment
    ? "Department"
    : isAdmin
    ? "Admin"
    : "Citizen";

  /* =====================================================
     GET CURRENT USER
     No setState inside useEffect
  ===================================================== */

  const user = useMemo(() => {
    try {
      let storageKey = "citizen_user";

      if (isDepartment) {
        storageKey = "department_user";
      } else if (isAdmin) {
        storageKey = "admin_user";
      }

      const storedUser = localStorage.getItem(storageKey);

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to load user:", error);
      return null;
    }
  }, [isDepartment, isAdmin, location.pathname]);

  /* =====================================================
     TOGGLE MOBILE SIDEBAR
  ===================================================== */

  const handleMenuClick = () => {
    if (setMobileOpen) {
      setMobileOpen((prev) => !prev);
    } else if (onMenuClick) {
      onMenuClick();
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    if (isDepartment) {
      localStorage.removeItem("department_token");
      localStorage.removeItem("department_user");

      navigate("/department-login");
    } else if (isAdmin) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");

      navigate("/admin-login");
    } else {
      localStorage.removeItem("citizen_token");
      localStorage.removeItem("citizen_user");

      navigate("/login");
    }

    setDropdownOpen(false);
  };

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const handleNotificationClick = () => {
    if (isDepartment) {
      navigate("/department/complaints");
    } else if (isAdmin) {
      navigate("/admin/complaints");
    } else {
      navigate("/citizen/notifications");
    }
  };

  /* =====================================================
     RENDER HEADER
  ===================================================== */

  return (
    <header className="dashboard-header">
      {/* LEFT SIDE */}

      <div className="dashboard-header-left">
        <button
          type="button"
          className="dashboard-menu-btn"
          onClick={handleMenuClick}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <div className="dashboard-header-title">
          <span className="dashboard-header-eyebrow">
            CIVIC CONNECT
          </span>

          <h2>{portalName} Portal</h2>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="dashboard-header-right">
        {/* NOTIFICATIONS */}

        <button
          type="button"
          className="dashboard-notification-btn"
          onClick={handleNotificationClick}
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="notification-dot" />
        </button>

        {/* USER MENU */}

        <div className="dashboard-user-wrapper">
          <button
            type="button"
            className="dashboard-user-btn"
            onClick={() =>
              setDropdownOpen((prev) => !prev)
            }
            aria-expanded={dropdownOpen}
            aria-label="User menu"
          >
            {/* AVATAR */}

            <div className="dashboard-user-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* USER INFORMATION */}

            <div className="dashboard-user-info">
              <strong>
                {user?.fullName || portalName}
              </strong>

              <span>
                {user?.department || `${portalName} User`}
              </span>
            </div>

            {/* CHEVRON */}

            <ChevronDown
              size={17}
              className={dropdownOpen ? "chevron-open" : ""}
            />
          </button>

          {/* USER DROPDOWN */}

          {dropdownOpen && (
            <div className="dashboard-user-dropdown">
              {/* USER DETAILS */}

              <div className="dropdown-user-header">
                <div className="dashboard-user-avatar large">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <strong>
                    {user?.fullName || "User"}
                  </strong>

                  <span>
                    {user?.email || "No email"}
                  </span>
                </div>
              </div>

              <div className="dropdown-divider" />

              {/* LOGOUT BUTTON */}

              <button
                type="button"
                onClick={handleLogout}
                className="dropdown-logout"
              >
                <LogOut size={17} />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

