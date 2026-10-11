
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Inspection = require("../models/Inspection");
const Complaint = require("../models/Complaint");
const authMiddleware = require("../middleware/authMiddleware");

/* =========================================================
   DEPARTMENT ACCESS
========================================================= */

const departmentOnly = (req, res, next) => {
  if (req.user?.role !== "department") {
    return res.status(403).json({
      success: false,
      message: "Department access required.",
    });
  }

  next();
};

/* =========================================================
   GET INSPECTIONS
   GET /api/inspections
========================================================= */

router.get(
  "/",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = req.user?.department;

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department is not assigned to this officer.",
        });
      }

      const inspections = await Inspection.find({
        department,
      })
        .populate(
          "complaint",
          "complaintId category subject location priority status"
        )
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        inspections,
      });
    } catch (error) {
      console.error(
        "GET INSPECTIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch inspections.",
      });
    }
  }
);

/* =========================================================
   CREATE INSPECTION
   POST /api/inspections
========================================================= */

router.post(
  "/",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const officerId = req.user?.id;
      const department = req.user?.department;

      const {
        complaintId,
        location,
        inspectionDate,
        findings,
        status,
        notes,
      } = req.body;

      if (!officerId) {
        return res.status(401).json({
          success: false,
          message: "Officer authentication information is missing.",
        });
      }

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department is not assigned to this officer.",
        });
      }

      if (!complaintId) {
        return res.status(400).json({
          success: false,
          message: "Complaint ID is required.",
        });
      }

      if (!location?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Inspection location is required.",
        });
      }

      if (!inspectionDate) {
        return res.status(400).json({
          success: false,
          message: "Inspection date is required.",
        });
      }

      if (!findings?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Inspection findings are required.",
        });
      }

      /* =====================================================
         FIND COMPLAINT
      ===================================================== */

      let complaint = null;

      if (mongoose.Types.ObjectId.isValid(complaintId)) {
        complaint = await Complaint.findOne({
          _id: complaintId,
          department,
        });
      }

      if (!complaint) {
        complaint = await Complaint.findOne({
          complaintId,
          department,
        });
      }

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found or complaint does not belong to your department.",
        });
      }

      /* =====================================================
         GENERATE INSPECTION ID
      ===================================================== */

      const year = new Date().getFullYear();

      const lastInspection = await Inspection.findOne({
        inspectionId: new RegExp(
          `^INS-${year}-`
        ),
      })
        .sort({ createdAt: -1 })
        .lean();

      let nextNumber = 1;

      if (lastInspection?.inspectionId) {
        const parts =
          lastInspection.inspectionId.split("-");

        const lastNumber = parseInt(
          parts[2],
          10
        );

        if (!Number.isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      const inspectionId = `INS-${year}-${String(
        nextNumber
      ).padStart(4, "0")}`;

      /* =====================================================
         CREATE INSPECTION
      ===================================================== */

      const inspection = await Inspection.create({
        inspectionId,

        complaint: complaint._id,
        complaintId: complaint.complaintId,

        department,

        officer: officerId,
        officerName:
          req.user?.fullName ||
          "Department Officer",

        location: location.trim(),

        inspectionDate,

        findings: findings.trim(),

        status: status || "Scheduled",

        notes: notes?.trim() || "",
      });

      return res.status(201).json({
        success: true,
        message: "Inspection created successfully.",
        inspection,
      });
    } catch (error) {
      console.error(
        "CREATE INSPECTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to create inspection.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   UPDATE INSPECTION
   PATCH /api/inspections/:id
========================================================= */

router.patch(
  "/:id",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = req.user?.department;

      const inspection =
        await Inspection.findOne({
          _id: req.params.id,
          department,
        });

      if (!inspection) {
        return res.status(404).json({
          success: false,
          message: "Inspection not found.",
        });
      }

      const {
        location,
        inspectionDate,
        findings,
        status,
        notes,
      } = req.body;

      if (location !== undefined) {
        inspection.location =
          location.trim();
      }

      if (inspectionDate !== undefined) {
        inspection.inspectionDate =
          inspectionDate;
      }

      if (findings !== undefined) {
        inspection.findings =
          findings.trim();
      }

      if (status !== undefined) {
        inspection.status = status;
      }

      if (notes !== undefined) {
        inspection.notes =
          notes.trim();
      }

      await inspection.save();

      return res.json({
        success: true,
        message: "Inspection updated successfully.",
        inspection,
      });
    } catch (error) {
      console.error(
        "UPDATE INSPECTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update inspection.",
      });
    }
  }
);

/* =========================================================
   DELETE INSPECTION
   DELETE /api/inspections/:id
========================================================= */

router.delete(
  "/:id",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = req.user?.department;

      const inspection =
        await Inspection.findOneAndDelete({
          _id: req.params.id,
          department,
        });

      if (!inspection) {
        return res.status(404).json({
          success: false,
          message: "Inspection not found.",
        });
      }

      return res.json({
        success: true,
        message: "Inspection deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE INSPECTION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete inspection.",
      });
    }
  }
);

module.exports = router;

