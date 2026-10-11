
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import ScrollToTop from "./components/ScrollToTop";

/* =========================
   LAYOUTS
========================= */
import CitizenLayout from "./layouts/CitizenLayout";
import DepartmentLayout from "./layouts/DepartmentLayout";
import AdminLayout from "./layouts/Adminlayout";

/* =========================
   PUBLIC
========================= */
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";

/* =========================
   AUTH
========================= */
import Login from "./pages/auth/Login";
import SignIn from "./pages/auth/Register";

/* =========================
   CITIZEN
========================= */
import ComplaintDetails from "./pages/citizen/ComplaintDetails";

import CitizenDashboard from "./pages/citizen/CitizenDashboard/CitizenDashboard";
import CitizenComplaints from "./pages/citizen/Complaints/Complaints";
import SubmitComplaint from "./pages/citizen/SubmitComplaint/SubmitComplaint";
import CitizenServiceRequest from "./pages/citizen/CitizenServiceRequest/CitizenServiceRequest";
import Appointments from "./pages/citizen/Appointments/Appointments";
import Payment from "./pages/citizen/Payment/Payments";
import Notifications from "./pages/citizen/Notifications/Notifications";
import CitizenEmergencies from "./pages/citizen/Emergencies/Emergencies";

/* =========================
   DEPARTMENT
========================= */
import DepartmentLogin from "./pages/department/DepartmentLogin/DepartmentLogin";
import DepartmentDashboard from "./pages/department/DepartmentDashboard/DepartmentDashboard";
import DepartmentComplaints from "./pages/department/DepartmentComplaints/DepartmentComplaints";
import FieldInspections from "./pages/department/FieldInspections/FieldInspections";
import DepartmentAssets from "./pages/department/Assets/Assets";
import DepartmentEmergencies from "./pages/department/Emergencies/Emergencies";
import DepartmentComplaintDetails from "./pages/department/DepartmentComplaintDetails/DepartmentComplaintDetails";
import ServiceApplications from "./pages/department/ServiceApplications/ServiceApplications";
/* =========================
   ADMIN
========================= */

import AdminLogin from "./pages/admin/AdminLogin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import Departments from "./pages/admin/Departments/Departments";
import Citizens from "./pages/admin/Citizens/Citizens";
import AdminComplaints from "./pages/admin/Complaints/Complaints";
import AdminAssets from "./pages/admin/Assets/Assets";
import AdminEmergencies from "./pages/admin/Emergencies/Emergencies";
import GISDashboard from "./pages/admin/GISDashboard/GISDashboard";
import Analytics from "./pages/admin/Analytics/Analytics";
import AuditLogs from "./pages/admin/AuditLogs/AuditLogs";
import Settings from "./pages/admin/Settings/Settings";



function App() {
  return (
    <>
      {/* =========================
          GLOBAL COMPONENTS
      ========================= */}

      <Toaster
        position="top-right"
        reverseOrder={false}
      />

      <ScrollToTop />

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />


        {/* =========================
            AUTH ROUTES
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<SignIn />}
        />

        <Route
          path="/signin"
          element={<SignIn />}
        />


        {/* =========================
            DEPARTMENT LOGIN
        ========================= */}

        <Route
          path="/department-login"
          element={<DepartmentLogin />}
        />


        {/* =========================
            CITIZEN PORTAL
        ========================= */}

       <Route path="/citizen" element={<CitizenLayout />}>
  <Route index element={<CitizenDashboard />} />

  <Route path="complaints" element={<CitizenComplaints />} />
  <Route path="submit-complaint" element={<SubmitComplaint />} />
  <Route path="complaints/:id" element={<ComplaintDetails />} />

  <Route path="services" element={<CitizenServiceRequest />} />

  <Route path="appointments" element={<Appointments />} />

  <Route path="payments" element={<Payment />} />
  <Route path="payments/:id" element={<Payment />} />

  <Route path="notifications" element={<Notifications />} />

  <Route path="emergency" element={<CitizenEmergencies />} />
</Route>

        {/* =========================
            CITIZEN COMPLAINT DETAILS
        ========================= */}

        <Route
          path="/citizen/complaints/:id"
          element={<ComplaintDetails />}
        />


        {/* =========================
            DEPARTMENT PORTAL
        ========================= */}

        <Route
          path="/department"
          element={<DepartmentLayout />}
        >
          <Route
            index
            element={<DepartmentDashboard />}
          />
          <Route
  path="service-applications"
  element={<ServiceApplications />}
/>
<Route
  path="complaints/:id"
  element={<DepartmentComplaintDetails />}
/>
          <Route
            path="complaints"
            element={<DepartmentComplaints />}
          />

          <Route
            path="inspections"
            element={<FieldInspections />}
          />

          <Route
            path="assets"
            element={<DepartmentAssets />}
          />

          <Route
    path="emergencies"
    element={<DepartmentEmergencies />}
  />
        </Route>


        {/* =========================
            ADMIN PORTAL
        ========================= */}
   <Route
  path="/admin/login"
  element={<AdminLogin />}
/>
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
       
          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="departments"
            element={<Departments />}
          />

          <Route
            path="citizens"
            element={<Citizens />}
          />

          <Route
            path="complaints"
            element={<AdminComplaints />}
          />

          <Route
            path="assets"
            element={<AdminAssets />}
          />

          <Route
            path="emergencies"
            element={<AdminEmergencies />}
          />

          <Route
            path="gis"
            element={<GISDashboard />}
          />

          <Route
            path="analytics"
            element={<Analytics />}
          />

          <Route
            path="audit-logs"
            element={<AuditLogs />}
          />
          <Route path="Settings" element={<Settings />} />
        </Route>


        {/* =========================
            FALLBACK
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </>
  );
}

export default App;
