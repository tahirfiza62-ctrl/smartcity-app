import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  CalendarDays,
  CreditCard,
  Bell,
  Building2,
  Map,
  BarChart3,
  Users,
  ShieldAlert,
  Settings,
  LogOut,
  AlertTriangle,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import "./Sidebar.css";

function Sidebar({
  type = "citizen",
  mobileOpen = false,
  setMobileOpen,
}) {
  const navigate = useNavigate();

  /* =========================================================
     CITIZEN MENU
  ========================================================= */

  const citizenMenu = [
    {
      title: "MAIN",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/citizen",
        },
        {
          name: "My Complaints",
          icon: FileText,
          path: "/citizen/complaints",
        },
        {
          name: "Emergency",
          icon: AlertTriangle,
          path: "/citizen/emergency",
        },
        {
          name: "Submit Complaint",
          icon: ClipboardList,
          path: "/citizen/submit-complaint",
        },
      ],
    },

    {
      title: "SERVICES",
      items: [
        {
          name: "Service Request",
          icon: ClipboardList,
          path: "/citizen/services",
        },
        {
          name: "Appointments",
          icon: CalendarDays,
          path: "/citizen/appointments",
        },
        {
          name: "Payments",
          icon: CreditCard,
          path: "/citizen/payments",
        },
        {
          name: "Notifications",
          icon: Bell,
          path: "/citizen/notifications",
        },
      ],
    },
  ];

  /* =========================================================
     DEPARTMENT MENU
  ========================================================= */

  const departmentMenu = [
    {
      title: "OPERATIONS",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/department",
        },
        {
          name: "Assigned Complaints",
          icon: FileText,
          path: "/department/complaints",
        },
        {
          name: "Field Inspections",
          icon: ClipboardList,
          path: "/department/inspections",
        },
        {
  name: "Service Applications",
  icon: ClipboardList,
  path: "/department/service-applications",
},
      ],
    },

    {
      title: "RESOURCES",
      items: [
        {
          name: "Assets",
          icon: Building2,
          path: "/department/assets",
        },
        {
          name: "Emergencies",
          icon: ShieldAlert,
          path: "/department/emergencies",
        },
      ],
    },
  ];

  /* =========================================================
     ADMIN MENU
  ========================================================= */

  const adminMenu = [
    {
      title: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin",
        },
        {
          name: "Departments",
          icon: Building2,
          path: "/admin/departments",
        },
        {
          name: "Citizens",
          icon: Users,
          path: "/admin/citizens",
        },
      ],
    },

    {
      title: "CITY OPERATIONS",
      items: [
        {
          name: "Complaints",
          icon: FileText,
          path: "/admin/complaints",
        },
        {
          name: "Assets",
          icon: Building2,
          path: "/admin/assets",
        },
        {
          name: "Emergencies",
          icon: ShieldAlert,
          path: "/admin/emergencies",
        },
      ],
    },

    {
      title: "ANALYTICS",
      items: [
        {
          name: "GIS Dashboard",
          icon: Map,
          path: "/admin/gis",
        },
        {
          name: "Analytics",
          icon: BarChart3,
          path: "/admin/analytics",
        },
        {
          name: "Audit Logs",
          icon: FileText,
          path: "/admin/audit-logs",
        },
      ],
    },
  ];

  /* =========================================================
     SELECT MENU
  ========================================================= */

  let menu = citizenMenu;

  if (type === "department") {
    menu = departmentMenu;
  }

  if (type === "admin") {
    menu = adminMenu;
  }

  /* =========================================================
     SIDEBAR TITLE
  ========================================================= */

  const title =
    type === "citizen"
      ? "CIVIC CONNECT"
      : type === "department"
      ? "CITY OPERATIONS"
      : "CITY ADMIN";

  const subtitle =
    type === "citizen"
      ? "Citizen Portal"
      : type === "department"
      ? "Department Portal"
      : "Administration";

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    if (type === "citizen") {
      localStorage.removeItem("citizen_token");
      localStorage.removeItem("citizen_user");
      navigate("/login");
      return;
    }

    if (type === "department") {
      localStorage.removeItem("department_token");
      localStorage.removeItem("department_user");
      navigate("/department-login");
      return;
    }

    if (type === "admin") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      navigate("/admin-login");
      return;
    }

    navigate("/login");
  };

  /* =========================================================
     CLOSE MOBILE SIDEBAR
  ========================================================= */

  const handleNavClick = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <aside
      className={`sidebar ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="brand">

        <div className="brand-logo">
          SC
        </div>

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        {setMobileOpen && (
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        )}

      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="nav">

        {menu.map((section) => (
          <div
            className="nav-section"
            key={section.title}
          >

            <div className="section-title">
              {section.title}
            </div>

            {section.items.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/${type}`}
                  className={({ isActive }) =>
                    `nav-item ${
                      isActive ? "active" : ""
                    }`
                  }
                  onClick={handleNavClick}
                >

                  <Icon size={18} />

                  <span>
                    {item.name}
                  </span>

                </NavLink>
              );
            })}

          </div>
        ))}

      </nav>


      {/* =====================================================
          BOTTOM
      ===================================================== */}

      <div className="sidebar-bottom">

      <NavLink
  to={
    type === "admin"
      ? "/admin/settings"
      : type === "department"
      ? "/department/settings"
      : "/citizen/settings"
  }
  className={({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`
  }
  onClick={handleNavClick}
>
  <Settings size={18} />
  <span>Settings</span>
</NavLink>

        <button
          type="button"
          className="nav-item logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={18} />

          <span>
            Logout
          </span>
        </button>

      </div>


      {/* =====================================================
          PROFILE
      ===================================================== */}

      <div className="sidebar-profile">

        <div className="avatar">
          U
        </div>

        <div className="sidebar-profile-info">

          <strong>
            {type === "admin"
              ? "System Administrator"
              : type === "department"
              ? "Department Officer"
              : "Citizen User"}
          </strong>

          <span>
            {type === "admin"
              ? "Administrator"
              : type === "department"
              ? "Government Officer"
              : "Citizen"}
          </span>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;