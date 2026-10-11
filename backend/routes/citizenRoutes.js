const express = require("express");

const User = require("../models/User");
const Complaint = require("../models/Complaint");
const ServiceRequest = require("../models/ServiceRequest");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   GET LOGGED-IN USER ID
========================================================= */

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId
  );
};

/* =========================================================
   CITIZEN DASHBOARD
   GET /api/citizen/dashboard
========================================================= */

router.get(
  "/dashboard",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      console.log("\n=================================");
      console.log("CITIZEN DASHBOARD");
      console.log("USER ID:", userId);
      console.log("=================================");

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      /* =====================================================
         GET USER
      ===================================================== */

      const user = await User.findById(userId).select(
        "fullName email role department status"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Citizen not found.",
        });
      }

      if (user.role !== "citizen") {
        return res.status(403).json({
          success: false,
          message:
            "Only citizens can access the citizen dashboard.",
        });
      }

      /* =====================================================
         COMPLAINTS

         Complaint model field = user
      ===================================================== */

      const totalComplaints =
        await Complaint.countDocuments({
          user: userId,
        });

      const pendingComplaints =
        await Complaint.countDocuments({
          user: userId,
          status: {
            $in: [
              "Submitted",
              "Pending",
              "Under Review",
              "In Progress",
            ],
          },
        });

      const resolvedComplaints =
        await Complaint.countDocuments({
          user: userId,
          status: "Resolved",
        });

      const recentComplaints =
        await Complaint.find({
          user: userId,
        })
          .sort({
            createdAt: -1,
          })
          .limit(5)
          .lean();

      console.log(
        "RECENT COMPLAINTS:",
        recentComplaints.length
      );

      /* =====================================================
         SERVICE REQUESTS

         ServiceRequest model field = citizen
      ===================================================== */

      const totalServiceRequests =
        await ServiceRequest.countDocuments({
          citizen: userId,
        });

      const serviceRequests =
        await ServiceRequest.find({
          citizen: userId,
        })
          .populate(
            "assignedOfficer",
            "fullName email department"
          )
          .populate("paymentId")
          .sort({
            createdAt: -1,
          })
          .limit(5)
          .lean();

      console.log(
        "SERVICE REQUESTS:",
        serviceRequests.length
      );

      /* =====================================================
         APPOINTMENTS

         Appointment model field = user
      ===================================================== */

      let appointments = [];

      try {
        appointments =
          await Appointment.find({
            user: userId,
          })
            .sort({
              createdAt: -1,
            })
            .limit(5)
            .lean();

        console.log(
          "APPOINTMENTS:",
          appointments.length
        );

        console.log(
          "APPOINTMENT DATA:",
          appointments
        );
      } catch (appointmentError) {
        console.error(
          "APPOINTMENT DASHBOARD ERROR:",
          appointmentError
        );

        appointments = [];
      }

      /* =====================================================
         NOTIFICATIONS
      ===================================================== */

      let notifications = [];

      try {
        notifications =
          await Notification.find({
            user: userId,
          })
            .sort({
              createdAt: -1,
            })
            .limit(5)
            .lean();
      } catch (notificationError) {
        console.error(
          "NOTIFICATION DASHBOARD ERROR:",
          notificationError
        );

        notifications = [];
      }

      /* =====================================================
         PAYMENTS
      ===================================================== */

      let payments = [];

      try {
        payments =
          await Payment.find({
            citizen: userId,
          })
            .sort({
              createdAt: -1,
            })
            .limit(5)
            .lean();
      } catch (paymentError) {
        console.error(
          "PAYMENT DASHBOARD ERROR:",
          paymentError
        );

        payments = [];
      }

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.status(200).json({
        success: true,

        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department || null,
        },

        statistics: {
          totalComplaints,
          pendingComplaints,
          resolvedComplaints,
          totalServiceRequests,
          totalAppointments: appointments.length,
        },

        recentComplaints,

        serviceRequests,

        appointments,

        notifications,

        payments,
      });
    } catch (error) {
      console.error(
        "\n================================="
      );

      console.error(
        "CITIZEN DASHBOARD ERROR:"
      );

      console.error(error);

      console.error(
        "=================================\n"
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load citizen dashboard.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   CITIZEN PROFILE
   GET /api/citizen/profile
========================================================= */

router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const user =
        await User.findById(userId).select(
          "fullName email role department status createdAt"
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(
        "GET CITIZEN PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load profile.",
      });
    }
  }
);

/* =========================================================
   CITIZEN COMPLAINTS
   GET /api/citizen/complaints
========================================================= */

router.get(
  "/complaints",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      /*
        IMPORTANT:
        Complaint model uses `user`
      */

      const complaints =
        await Complaint.find({
          user: userId,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        complaints,
      });
    } catch (error) {
      console.error(
        "GET CITIZEN COMPLAINTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch complaints.",
      });
    }
  }
);

/* =========================================================
   CITIZEN SERVICE REQUESTS
   GET /api/citizen/service-requests
========================================================= */

router.get(
  "/service-requests",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      /*
        IMPORTANT:
        ServiceRequest model uses `citizen`
      */

      const serviceRequests =
        await ServiceRequest.find({
          citizen: userId,
        })
          .populate("paymentId")
          .populate(
            "assignedOfficer",
            "fullName email department"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        serviceRequests,
      });
    } catch (error) {
      console.error(
        "GET CITIZEN SERVICE REQUESTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch service requests.",
      });
    }
  }
);

module.exports = router;