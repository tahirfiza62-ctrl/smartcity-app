const express = require("express");

const ServiceRequest = require("../models/ServiceRequest");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   DEPARTMENT ONLY
========================================================= */

const departmentOnly = (req, res, next) => {
  if (req.user?.role !== "department") {
    return res.status(403).json({
      success: false,
      message: "Department access required",
    });
  }

  if (!req.user?.department) {
    return res.status(403).json({
      success: false,
      message: "Department not assigned",
    });
  }

  next();
};

/* =========================================================
   GET DEPARTMENT SERVICE APPLICATIONS
========================================================= */

router.get(
  "/service-applications",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const applications =
        await ServiceRequest.find({
          department: req.user.department,
          paymentStatus: "Paid",
        })
          .populate(
            "citizen",
            "fullName email"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        applications,
      });
    } catch (error) {
      console.error(
        "GET SERVICE APPLICATIONS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch service applications",
      });
    }
  }
);

/* =========================================================
   UPDATE SERVICE STATUS
========================================================= */

router.patch(
  "/service-applications/:id",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const {
        serviceStatus,
        responseNotes,
      } = req.body;

      const application =
        await ServiceRequest.findOne({
          _id: req.params.id,
          department: req.user.department,
        });

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Service application not found",
        });
      }

      const allowedStatuses = [
        "Submitted",
        "Under Review",
        "In Progress",
        "Completed",
        "Rejected",
      ];

      if (
        serviceStatus &&
        !allowedStatuses.includes(serviceStatus)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid service status",
        });
      }

      if (serviceStatus) {
        application.serviceStatus =
          serviceStatus;
      }

      if (responseNotes !== undefined) {
        application.responseNotes =
          responseNotes;
      }

      await application.save();

      res.json({
        success: true,
        message:
          "Service application updated successfully",
        application,
      });
    } catch (error) {
      console.error(
        "UPDATE SERVICE APPLICATION ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update service application",
      });
    }
  }
);

module.exports = router;