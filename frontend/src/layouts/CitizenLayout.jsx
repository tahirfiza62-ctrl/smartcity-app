import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/Header";

import "./CitizenLayout.css";

const CitizenLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="citizen-layout">

      <Sidebar
        type="citizen"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {mobileOpen && (
        <div
          className="citizen-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="citizen-main">

        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="citizen-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default CitizenLayout;