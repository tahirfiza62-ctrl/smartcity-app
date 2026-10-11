const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

const departmentRoutes =
  require("./routes/departmentRoutes");

const authRoutes =
  require("./routes/authRoutes");

const contactRoutes =
  require("./routes/contactRoutes");

const citizenRoutes =
  require("./routes/citizenRoutes");

const complaintRoutes =
  require("./routes/complaintRoutes");

const serviceRequestRoute =
  require("./routes/serviceRequestRoute");

const appointmentRoute =
  require("./routes/appointmentRoute");

const paymentRoute =
  require("./routes/paymentRoute");

const notificationRoutes =
  require("./routes/notificationRoutes");

const inspectionRoutes =
  require("./routes/inspectionRoutes");

const assetRoutes =
  require("./routes/assetRoutes");

const emergencyRoutes =
  require("./routes/emergencyRoutes");

const departmentServiceRoutes =
  require("./routes/departmentServiceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const publicDepartmentRoutes =
  require("./routes/publicDepartmentRoutes");
/* =========================================================
   ENVIRONMENT
========================================================= */

dotenv.config();

/* =========================================================
   DATABASE
========================================================= */

connectDB();

/* =========================================================
   APP
========================================================= */

const app = express();

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
  })
);

/* =========================================================
   BODY PARSER
   MUST COME BEFORE ALL API ROUTES
========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

/* =========================================================
   API ROUTES
========================================================= */

/* ---------- AUTH ---------- */

app.use(
  "/api/auth",
  authRoutes
);

/* ---------- CONTACT ---------- */

app.use(
  "/api/contact",
  contactRoutes
);

/* ---------- CITIZEN ---------- */

app.use(
  "/api/citizen",
  citizenRoutes
);

/* ---------- COMPLAINTS ---------- */

app.use(
  "/api/complaints",
  complaintRoutes
);

/* ---------- SERVICE REQUESTS ---------- */

app.use(
  "/api/service-requests",
  serviceRequestRoute
);

/* ---------- APPOINTMENTS ---------- */

app.use(
  "/api/appointments",
  appointmentRoute
);

/* ---------- PAYMENTS ---------- */

app.use(
  "/api/payments",
  paymentRoute
);

/* ---------- NOTIFICATIONS ---------- */

app.use(
  "/api/notifications",
  notificationRoutes
);

/* ---------- DEPARTMENT SERVICES ---------- */

app.use(
  "/api/department",
  departmentServiceRoutes
);

/* ---------- DEPARTMENT ---------- */

app.use(
  "/api/department",
  departmentRoutes
);

/* ---------- INSPECTIONS ---------- */

app.use(
  "/api/inspections",
  inspectionRoutes
);

/* ---------- ASSETS ---------- */

app.use(
  "/api/assets",
  assetRoutes
);

/* ---------- EMERGENCIES ---------- */

app.use(
  "/api/emergencies",
  emergencyRoutes
);
app.use("/api/admin", adminRoutes);
app.use("/api/departments", publicDepartmentRoutes);
/* =========================================================
   BASIC ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "SmartCity Backend API is running.",
  });
});

/* =========================================================
   404 HANDLER
   MUST BE AFTER ALL ROUTES
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (err, req, res, next) => {
    console.error(
      "GLOBAL ERROR:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

/* =========================================================
   SERVER
========================================================= */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `SmartCity Backend running on port ${PORT}`
  );
});