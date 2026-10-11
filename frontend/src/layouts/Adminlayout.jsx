
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar
        type="admin"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="admin-main">
        <Header
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

