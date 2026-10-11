
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");
const authMiddleware = require("../middleware/authMiddleware");
const createNotification = require("../utils/createNotification");


/* =========================================================
   DEPARTMENT MAPPING
========================================================= */

/* =========================================================
   LEGACY DEPARTMENT MAPPING
========================================================= */

const departmentMap = {
  "Municipal Department": "Municipal Department",
  "Medical Department": "Medical Department",
  "Garbage & Waste": "Garbage & Waste",
  "Water Supply": "Water Supply",
  Sewerage: "Sewerage",
  "Public Transport": "Public Transport",
  "Traffic Signals": "Traffic Signals",
  Emergency: "Emergency",
  Other: "Other",
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* =========================================================
   HELPERS
========================================================= */

const getUserId = (req) =>
  req.user?.id || req.user?._id || req.user?.userId;

const generateComplaintId = async () => {
  const year = new Date().getFullYear();

  const lastComplaint = await Complaint.findOne({
    complaintId: new RegExp(`^CMP-${year}-`),
  })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1;

  if (lastComplaint?.complaintId) {
    const parts = lastComplaint.complaintId.split("-");
    const lastNumber = parseInt(parts[2], 10);

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `CMP-${year}-${String(nextNumber).padStart(4, "0")}`;
};

const findComplaintById = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const complaint = await Complaint.findById(id);
    if (complaint) return complaint;
  }

  return Complaint.findOne({ complaintId: id });
};

/* =========================================================
   CREATE COMPLAINT
   POST /api/complaints
========================================================= */

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication information is missing.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(userId).select(
      "fullName email role status"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const { category, subject, description, location, priority } =
      req.body;

    if (
      !category?.trim() ||
      !subject?.trim() ||
      !description?.trim() ||
      !location?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category, subject, description, and location are required.",
      });
    }

  const cleanCategory = category.trim();

/*
  First, find the selected department in MongoDB.
  This allows departments created through the admin website.
*/

const matchedDepartment = await Department.findOne({
  name: {
    $regex: `^${escapeRegex(cleanCategory)}$`,
    $options: "i",
  },
  status: {
    $in: ["active", "Active"],
  },
}).lean();

let department;
let finalCategory;

if (matchedDepartment) {
  // Use the actual department name stored in MongoDB.
  department = matchedDepartment.name;
  finalCategory = matchedDepartment.name;
} else if (departmentMap[cleanCategory]) {
  // Keep compatibility with your existing predefined categories.
  department = departmentMap[cleanCategory];
  finalCategory = cleanCategory;
} else {
  return res.status(400).json({
    success: false,
    message:
      "Invalid complaint category. Please select an active department.",
  });
}

    const allowedPriorities = ["Low", "Medium", "High"];
    const cleanPriority = priority || "Medium";

    if (!allowedPriorities.includes(cleanPriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint priority.",
      });
    }

   const complaintId = await generateComplaintId();

const complaint = await Complaint.create({
  complaintId,

  user: user._id,
  citizenId: String(user._id),
  citizenName: user.fullName,
  citizenEmail: user.email,

  category: finalCategory,

  // Store both the department reference and its name.
  departmentId: matchedDepartment
    ? matchedDepartment._id
    : null,

  department,

  subject: subject.trim(),
  description: description.trim(),
  location: location.trim(),

  priority: cleanPriority,
  status: "Submitted",

  departmentResponse: "",
  resolution: "",
});

    try {
      await createNotification({
        userId: user._id,
        type: "complaint",
        title: "Complaint Submitted",
        message: `Your complaint ${complaint.complaintId} has been submitted successfully.`,
        relatedId: complaint._id,
      });
    } catch (notificationError) {
      console.error(
        "Complaint notification error:",
        notificationError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    console.error("CREATE COMPLAINT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit complaint.",
    });
  }
});

/* =========================================================
   GET MY COMPLAINTS
   GET /api/complaints/my
========================================================= */

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const complaints = await Complaint.find({
      citizenId: String(userId),
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("GET MY COMPLAINTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your complaints.",
    });
  }
});

/* =========================================================
   GET ALL COMPLAINTS — ADMIN ONLY
   IMPORTANT: Must be BEFORE /:id
   GET /api/complaints/admin/all
========================================================= */

router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Valid authentication is required.",
      });
    }

    const admin = await User.findById(userId).select("role status");

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    if (admin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive.",
      });
    }

    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Admin fetched ${complaints.length} complaints.`);

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("ADMIN GET COMPLAINTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints.",
    });
  }
});

/* =========================================================
   GET DEPARTMENT COMPLAINT DETAILS
   GET /api/complaints/department/:id
========================================================= */

router.get(
  "/department/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({
          success: false,
          message: "Valid authentication is required.",
        });
      }

      const officer = await User.findById(userId).select(
        "fullName email role department status"
      );

      if (!officer) {
        return res.status(404).json({
          success: false,
          message: "Officer account not found.",
        });
      }

      if (
        officer.role !== "department" ||
        officer.status !== "active"
      ) {
        return res.status(403).json({
          success: false,
          message: "Active department officer access required.",
        });
      }

      const complaint = await findComplaintById(req.params.id);

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found.",
        });
      }

      if (complaint.department !== officer.department) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this complaint.",
        });
      }

      return res.json({
        success: true,
        complaint,
        officer: {
          id: officer._id,
          fullName: officer.fullName,
          email: officer.email,
          department: officer.department,
        },
      });
    } catch (error) {
      console.error("DEPARTMENT COMPLAINT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch department complaint.",
      });
    }
  }
);

/* =========================================================
   UPDATE COMPLAINT STATUS
   PATCH /api/complaints/:id/status
========================================================= */

router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Valid authentication is required.",
      });
    }

    const user = await User.findById(userId).select(
      "fullName role department status"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (
      user.status !== "active" ||
      !["admin", "department"].includes(user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update complaints.",
      });
    }

    const allowedStatuses = [
      "Submitted",
      "Pending",
      "Under Review",
      "In Progress",
      "Resolved",
      "Rejected",
      "Closed",
    ];

    const { status, departmentResponse } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status.",
      });
    }

    const complaint = await findComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    if (
      user.role === "department" &&
      complaint.department !== user.department
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot update another department's complaint.",
      });
    }

    complaint.status = status;

    if (departmentResponse !== undefined) {
      complaint.departmentResponse = departmentResponse;
    }

    if (status === "Resolved") {
      complaint.resolution =
        departmentResponse || complaint.resolution || "";
    }

    await complaint.save();

    try {
      await createNotification({
        userId: complaint.user || complaint.citizenId,
        type: "complaint",
        title: "Complaint Status Updated",
        message: `Your complaint ${complaint.complaintId} status has been updated to ${status}.`,
        relatedId: complaint._id,
      });
    } catch (notificationError) {
      console.error(
        "Status notification error:",
        notificationError.message
      );
    }

    return res.json({
      success: true,
      message: "Complaint status updated successfully.",
      complaint,
    });
  } catch (error) {
    console.error("UPDATE COMPLAINT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update complaint status.",
    });
  }
});

/* =========================================================
   GET SINGLE COMPLAINT — CITIZEN OWNER
   Keep this route AFTER /admin/all and /department/:id
   GET /api/complaints/:id
========================================================= */

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const id = req.params.id;
    let complaint = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findOne({
        _id: id,
        citizenId: String(userId),
      });
    }

    if (!complaint) {
      complaint = await Complaint.findOne({
        complaintId: id,
        citizenId: String(userId),
      });
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    return res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("GET SINGLE COMPLAINT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint.",
    });
  }
});

module.exports = router;