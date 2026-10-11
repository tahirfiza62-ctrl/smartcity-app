const express = require("express");

const Complaint = require("../models/Complaint");
const ServiceRequest = require("../models/ServiceRequest");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   DEPARTMENT ACCESS CHECK
========================================================= */

const departmentOnly = (req, res, next) => {
  if (req.user?.role !== "department") {
    return res.status(403).json({
      message: "Department access required.",
    });
  }

  next();
};

/* =========================================================
   GET DEPARTMENT DASHBOARD
   GET /api/department/dashboard
========================================================= */

router.get(
  "/dashboard",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = req.user?.department;

      if (!department) {
        return res.status(400).json({
          message:
            "Department is not assigned to this account.",
        });
      }

      /* =====================================================
         COMPLAINTS
      ===================================================== */

      const complaints = await Complaint.find({
        department,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();

      /* =====================================================
         COMPLAINT STATISTICS
      ===================================================== */

      const totalComplaints =
        await Complaint.countDocuments({
          department,
        });

      const pendingComplaints =
        await Complaint.countDocuments({
          department,
          status: "Pending",
        });

      const inProgressComplaints =
        await Complaint.countDocuments({
          department,
          status: "In Progress",
        });

      const resolvedComplaints =
        await Complaint.countDocuments({
          department,
          status: "Resolved",
        });

      /* =====================================================
         SERVICE APPLICATIONS
      ===================================================== */

      const serviceApplications =
        await ServiceRequest.find({
          department,
        })
          .populate(
            "citizen",
            "fullName email"
          )
          .sort({
            createdAt: -1,
          })
          .limit(20)
          .lean();

      /* =====================================================
         SERVICE APPLICATION STATISTICS
      ===================================================== */

      const totalServiceApplications =
        await ServiceRequest.countDocuments({
          department,
        });

      const pendingServiceApplications =
        await ServiceRequest.countDocuments({
          department,
          status: {
            $in: [
              "Submitted",
              "Under Review",
            ],
          },
        });

      const processingServiceApplications =
        await ServiceRequest.countDocuments({
          department,
          status: "Processing",
        });

      const approvedServiceApplications =
        await ServiceRequest.countDocuments({
          department,
          status: "Approved",
        });

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.json({
        success: true,

        department,

        stats: {
          totalComplaints,
          pendingComplaints,
          inProgressComplaints,
          resolvedComplaints,

          totalServiceApplications,
          pendingServiceApplications,
          processingServiceApplications,
          approvedServiceApplications,
        },

        complaints,

        serviceApplications,
      });
    } catch (error) {
      console.error(
        "Department dashboard error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load department dashboard.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET ALL DEPARTMENT COMPLAINTS
   GET /api/department/complaints
========================================================= */

router.get(
  "/complaints",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = req.user?.department;

      if (!department) {
        return res.status(400).json({
          message:
            "Department is not assigned to this account.",
        });
      }

      const complaints = await Complaint.find({
        department,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

      return res.json({
        department,
        complaints,
      });
    } catch (error) {
      console.error(
        "Department complaints error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load complaints.",
      });
    }
  }
);

/* =========================================================
   GET DEPARTMENT COMPLAINT DETAILS
   GET /api/department/complaints/:id
========================================================= */

router.get(
  "/complaints/:id",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = req.user?.department;

      if (!department) {
        return res.status(400).json({
          message:
            "Department is not assigned to this account.",
        });
      }

      const complaint =
        await Complaint.findOne({
          _id: req.params.id,
          department,
        }).lean();

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found.",
        });
      }

      return res.json(complaint);
    } catch (error) {
      console.error(
        "Complaint details error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load complaint.",
      });
    }
  }
);

/* =========================================================
   UPDATE COMPLAINT STATUS
   PATCH /api/department/complaints/:id/status
========================================================= */

router.patch(
  "/complaints/:id/status",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = req.user?.department;

      if (!department) {
        return res.status(400).json({
          message:
            "Department is not assigned to this account.",
        });
      }

      const {
        status,
        departmentResponse,
      } = req.body;

      const allowedStatuses = [
        "Submitted",
        "Pending",
        "Under Review",
        "In Progress",
        "Resolved",
        "Rejected",
        "Closed",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid complaint status.",
        });
      }

      const complaint =
        await Complaint.findOne({
          _id: req.params.id,
          department,
        });

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found.",
        });
      }

      complaint.status = status;

      if (
        departmentResponse !== undefined
      ) {
        complaint.departmentResponse =
          departmentResponse.trim();
      }

      await complaint.save();

      return res.status(200).json({
        success: true,
        message:
          "Complaint updated successfully.",
        complaint,
      });
    } catch (error) {
      console.error(
        "Update complaint error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update complaint.",
      });
    }
  }
);


router.get("/active", async (req, res) => {
  try {
    const departments = await Department.find({
      status: { $regex: /^active$/i },
    })
      .select("_id name description status")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("GET ACTIVE DEPARTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load departments.",
    });
  }
});

// GET /api/departments/active
router.get("/active", async (req, res) => {
  try {
    const departments = await Department.find({
      status: { $regex: /^active$/i },
    })
      .select("_id name description")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("GET ACTIVE DEPARTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load departments.",
    });
  }
});

module.exports = router;
