import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/Header";

import "./DepartmentLayout.css";

const DepartmentLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="department-layout">

      {/* SIDEBAR */}
      <Sidebar
        type="department"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="department-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN AREA */}
      <div className="department-main">

        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="department-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DepartmentLayout;