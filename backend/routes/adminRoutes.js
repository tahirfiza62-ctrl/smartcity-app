
// backend/routes/adminRoutes.js

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Department = require("../models/Department");
const Complaint = require("../models/Complaint");
const requireAdmin = require("../middleware/requireAdmin");
const Asset = require("../models/Asset");
const router = express.Router();
const Emergency = require("../models/Emergency");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AuditLog = require("../models/AuditLog");

// Protect every route in this router.
router.use(requireAdmin);

/* =========================================================
   NORMALIZE DEPARTMENT STATUS
========================================================= */

const normalizeStatus = (value) => {
  const status = String(value || "Active")
    .trim()
    .toLowerCase();

  return status === "inactive" ? "Inactive" : "Active";
};

/* =========================================================
   VALIDATE DEPARTMENT
========================================================= */

const validateDepartment = (body) => {
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();

  if (!name) {
    return "Department name is required.";
  }

  if (name.length > 100) {
    return "Department name cannot exceed 100 characters.";
  }

  if (!description) {
    return "Department description is required.";
  }

  if (description.length > 500) {
    return "Department description cannot exceed 500 characters.";
  }

  // Email is optional, but must be valid if supplied.
if (email && !EMAIL_REGEX.test(email)) {
  return "Please provide a valid department email.";
}
  // Phone is optional, but must be valid if supplied.
  if (phone && !/^[0-9+()\-\s]{7,20}$/.test(phone)) {
    return "Please provide a valid department phone number.";
  }

  // Accept both lowercase and capitalized status values.
  if (body.status !== undefined && body.status !== null) {
    const status = String(body.status).trim().toLowerCase();

    if (!["active", "inactive"].includes(status)) {
      return "Department status must be active or inactive.";
    }
  }

  return null;
};

/* =========================================================
   ESCAPE REGEX CHARACTERS
========================================================= */

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/* =========================================================
   ADMIN DASHBOARD
   GET /api/admin/dashboard
========================================================= */

router.get("/dashboard", async (req, res) => {
  try {
    const [
      citizens,
      officers,
      departments,
      complaints,
      resolved,
      pending,
      emergencies,
      recentComplaints,
    ] = await Promise.all([
      User.countDocuments({ role: "citizen" }),

      User.countDocuments({ role: "department" }),

      Department.countDocuments({}),

      Complaint.countDocuments({}),

      Complaint.countDocuments({
        status: { $regex: /^(resolved|completed)$/i },
      }),

      Complaint.countDocuments({
        status: {
          $not: {
            $regex: /^(resolved|completed|rejected|cancelled)$/i,
          },
        },
      }),

      Complaint.countDocuments({
        $or: [
          { type: { $regex: /emergency/i } },
          { category: { $regex: /emergency/i } },
          { complaintType: { $regex: /emergency/i } },
        ],
      }),

      Complaint.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        citizens,
        officers,
        departments,
        complaints,
        resolved,
        pending,
        emergencies,
      },
      recentComplaints,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard data.",
    });
  }
});

/* =========================================================
   GET ALL DEPARTMENTS
   GET /api/admin/departments
========================================================= */

router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find({})
      .sort({ createdAt: -1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error("GET DEPARTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve departments.",
    });
  }
});

/* =========================================================
   CREATE DEPARTMENT
   POST /api/admin/departments
========================================================= */

router.post("/departments", async (req, res) => {
  try {
    const validationError = validateDepartment(req.body || {});

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const name = String(req.body.name).trim();

    // Check for a duplicate name, ignoring letter case.
    const existing = await Department.findOne({
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: "i",
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A department with this name already exists.",
      });
    }

    const department = await Department.create({
      name,
      description: String(req.body.description).trim(),
      headName: String(req.body.headName || "").trim(),
      email: String(req.body.email || "").trim().toLowerCase(),
      phone: String(req.body.phone || "").trim(),
      location: String(req.body.location || "").trim(),
      status: normalizeStatus(req.body.status),
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      department,
    });
  } catch (error) {
    console.error("CREATE DEPARTMENT ERROR:", error);

    // Handle duplicate-key errors from MongoDB.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A department with this name already exists.",
      });
    }

    // Show useful validation details during development.
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors)
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        message: details || "Department validation failed.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Unable to create department.",
    });
  }
});

/* =========================================================
   UPDATE DEPARTMENT
   PUT /api/admin/departments/:id
========================================================= */

router.put("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    const validationError = validateDepartment(req.body || {});

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const name = String(req.body.name).trim();

    const duplicate = await Department.findOne({
      _id: { $ne: id },
      name: {
        $regex: `^${escapeRegex(name)}$`,
        $options: "i",
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another department already uses this name.",
      });
    }

    const department = await Department.findByIdAndUpdate(
      id,
      {
        name,
        description: String(req.body.description).trim(),
        headName: String(req.body.headName || "").trim(),
        email: String(req.body.email || "").trim().toLowerCase(),
        phone: String(req.body.phone || "").trim(),
        location: String(req.body.location || "").trim(),
        status: normalizeStatus(req.body.status),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      department,
    });
  } catch (error) {
    console.error("UPDATE DEPARTMENT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another department already uses this name.",
      });
    }

    if (error.name === "ValidationError") {
      const details = Object.values(error.errors)
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        message: details || "Department validation failed.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Unable to update department.",
    });
  }
});

/* =========================================================
   DELETE DEPARTMENT
   DELETE /api/admin/departments/:id
========================================================= */

router.delete("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    // Do not delete a department that still has assigned complaints.
    const assignedComplaints = await Complaint.exists({
      $or: [
        { departmentId: id },
        { department: department.name },
      ],
    });

    if (assignedComplaints) {
      return res.status(409).json({
        success: false,
        message:
          "This department has assigned complaints. Set it to inactive instead of deleting it.",
      });
    }

    await Department.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE DEPARTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Unable to delete department.",
    });
  }
});

/*
  CREATE A LOGIN ACCOUNT FOR AN EXISTING DEPARTMENT
  POST /api/admin/departments/:id/account
*/

router.post("/departments/:id/account", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, password } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    if (
      String(department.status).toLowerCase() !== "active"
    ) {
      return res.status(400).json({
        success: false,
        message: "Activate the department before creating its login.",
      });
    }

    const accountEmail = String(
      email || department.email || ""
    ).trim().toLowerCase();

    const accountName = String(
      fullName || department.headName || department.name
    ).trim();

   if (!accountEmail || !EMAIL_REGEX.test(accountEmail)) {
  return res.status(400).json({
    success: false,
    message: "A valid department login email is required.",
  });
}
    if (!accountName) {
      return res.status(400).json({
        success: false,
        message: "Staff member name is required.",
      });
    }

    const existingUser = await User.findOne({
      email: accountEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: accountName,
      email: accountEmail,
      password: hashedPassword,
      authProvider: "local",
      role: "department",
      department: department.name,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Department login account created successfully.",
      account: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("CREATE DEPARTMENT ACCOUNT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create department login account.",
    });
  }
});

/* =========================================================
   GET ALL REGISTERED CITIZENS
   GET /api/admin/citizens
========================================================= */

router.get("/citizens", async (req, res) => {
  try {
    const citizens = await User.find({
      role: "citizen",
    })
      .select("fullName email role status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: citizens.length,
      citizens,
    });
  } catch (error) {
    console.error("GET CITIZENS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve registered citizens.",
    });
  }
});

/* =========================================================
   UPDATE CITIZEN ACCOUNT STATUS
   PATCH /api/admin/citizens/:id/status
========================================================= */

router.patch("/citizens/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body.status || "")
      .trim()
      .toLowerCase();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid citizen ID.",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
      });
    }

    const citizen = await User.findOneAndUpdate(
      {
        _id: id,
        role: "citizen",
      },
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("fullName email role status createdAt updatedAt")
      .lean();

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Citizen status updated successfully.",
      citizen,
    });
  } catch (error) {
    console.error("UPDATE CITIZEN STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update citizen status.",
    });
  }
});

/* =========================================================
   ASSETS MANAGEMENT
   GET    /api/admin/assets
   GET    /api/admin/assets/:id
   POST   /api/admin/assets
   PUT    /api/admin/assets/:id
   DELETE /api/admin/assets/:id
========================================================= */

// GET ALL ASSETS
router.get("/assets", async (req, res) => {
  try {
    const assets = await Asset.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: assets.length,
      assets,
    });
  } catch (error) {
    console.error("GET ADMIN ASSETS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve assets.",
    });
  }
});

// GET ONE ASSET
router.get("/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID.",
      });
    }

    const asset = await Asset.findById(id).lean();

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
      });
    }

    return res.status(200).json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error("GET ADMIN ASSET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve asset details.",
    });
  }
});

// CREATE ASSET
router.post("/assets", async (req, res) => {
  try {
    const {
      assetId,
      name,
      category,
      department,
      location,
      condition,
      status,
      purchaseDate,
      purchaseCost,
      description,
    } = req.body || {};

    if (
      !String(assetId || "").trim() ||
      !String(name || "").trim() ||
      !String(category || "").trim() ||
      !String(department || "").trim() ||
      !String(location || "").trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Asset ID, name, category, department and location are required.",
      });
    }

    const normalizedAssetId = String(assetId).trim().toUpperCase();

    const duplicate = await Asset.findOne({
      assetId: normalizedAssetId,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "An asset with this ID already exists.",
      });
    }

    if (
      purchaseCost !== undefined &&
      purchaseCost !== "" &&
      (!Number.isFinite(Number(purchaseCost)) ||
        Number(purchaseCost) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Purchase cost must be a valid non-negative number.",
      });
    }

    let parsedPurchaseDate = null;

    if (purchaseDate) {
      parsedPurchaseDate = new Date(purchaseDate);

      if (Number.isNaN(parsedPurchaseDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid purchase date.",
        });
      }

      if (parsedPurchaseDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Purchase date cannot be in the future.",
        });
      }
    }

    const asset = await Asset.create({
      assetId: normalizedAssetId,
      name: String(name).trim(),
      type: String(category).trim(),
      category: String(category).trim(),
      department: String(department).trim(),
      location: String(location).trim(),
      condition: condition || "Good",
      status: status || "Available",
      purchaseDate: parsedPurchaseDate,
      purchaseCost:
        purchaseCost === undefined || purchaseCost === ""
          ? 0
          : Number(purchaseCost),
      description: String(description || "").trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Asset created successfully.",
      asset,
    });
  } catch (error) {
    console.error("CREATE ADMIN ASSET ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An asset with this ID already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(" "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create asset.",
    });
  }
});

// UPDATE ASSET
router.put("/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID.",
      });
    }

    const {
      assetId,
      name,
      category,
      department,
      location,
      condition,
      status,
      purchaseDate,
      purchaseCost,
      description,
    } = req.body || {};

    if (
      !String(assetId || "").trim() ||
      !String(name || "").trim() ||
      !String(category || "").trim() ||
      !String(department || "").trim() ||
      !String(location || "").trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Asset ID, name, category, department and location are required.",
      });
    }

    const normalizedAssetId = String(assetId).trim().toUpperCase();

    const duplicate = await Asset.findOne({
      assetId: normalizedAssetId,
      _id: { $ne: id },
    }).lean();

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another asset already uses this ID.",
      });
    }

    if (
      purchaseCost !== undefined &&
      purchaseCost !== "" &&
      (!Number.isFinite(Number(purchaseCost)) ||
        Number(purchaseCost) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Purchase cost must be a valid non-negative number.",
      });
    }

    let parsedPurchaseDate = null;

    if (purchaseDate) {
      parsedPurchaseDate = new Date(purchaseDate);

      if (Number.isNaN(parsedPurchaseDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid purchase date.",
        });
      }

      if (parsedPurchaseDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Purchase date cannot be in the future.",
        });
      }
    }

    const asset = await Asset.findByIdAndUpdate(
      id,
      {
        assetId: normalizedAssetId,
        name: String(name).trim(),
        type: String(category).trim(),
        category: String(category).trim(),
        department: String(department).trim(),
        location: String(location).trim(),
        condition: condition || "Good",
        status: status || "Available",
        purchaseDate: parsedPurchaseDate,
        purchaseCost:
          purchaseCost === undefined || purchaseCost === ""
            ? 0
            : Number(purchaseCost),
        description: String(description || "").trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset updated successfully.",
      asset,
    });
  } catch (error) {
    console.error("UPDATE ADMIN ASSET ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another asset already uses this ID.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(" "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update asset.",
    });
  }
});

// DELETE ASSET
router.delete("/assets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID.",
      });
    }

    const asset = await Asset.findByIdAndDelete(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ADMIN ASSET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete asset.",
    });
  }
});

/* =========================================================
   ADMIN EMERGENCY MANAGEMENT

   GET   /api/admin/emergencies
   PATCH /api/admin/emergencies/:id/status
========================================================= */

/* GET ALL EMERGENCIES */

router.get("/emergencies", async (req, res) => {
  try {
    const emergencies = await Emergency.find({})
      .populate("citizen", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: emergencies.length,
      emergencies,
    });
  } catch (error) {
    console.error("GET ADMIN EMERGENCIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve emergency reports.",
    });
  }
});

/* UPDATE EMERGENCY STATUS */

router.patch("/emergencies/:id/status", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency ID.",
      });
    }

    let status = String(req.body.status || "")
      .trim()
      .toLowerCase();

    /*
      The frontend currently uses "Pending".
      The Emergency model uses "Reported".
      Convert the frontend value to the model's value.
    */

    if (status === "pending") {
      status = "reported";
    }

    const allowedStatuses = [
      "reported",
      "assigned",
      "in progress",
      "resolved",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Reported, Assigned, In Progress, Resolved, or Cancelled.",
      });
    }

    const formattedStatus = {
      reported: "Reported",
      assigned: "Assigned",
      "in progress": "In Progress",
      resolved: "Resolved",
      cancelled: "Cancelled",
    }[status];

    const emergency = await Emergency.findById(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency report not found.",
      });
    }

    emergency.status = formattedStatus;

    await emergency.save();

    return res.status(200).json({
      success: true,
      message: "Emergency status updated successfully.",
      emergency,
    });
  } catch (error) {
    console.error("UPDATE ADMIN EMERGENCY STATUS ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "The requested emergency status is invalid.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update emergency status.",
    });
  }
});

/* =========================================================
   GIS DASHBOARD DATA
   GET /api/admin/gis
========================================================= */

router.get("/gis", async (req, res) => {
  try {
    const [emergencies, complaints, assets] = await Promise.all([
      Emergency.find({})
        .populate("citizen", "fullName email")
        .sort({ createdAt: -1 })
        .lean(),

      Complaint.find({})
        .sort({ createdAt: -1 })
        .lean(),

      Asset.find({})
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        emergencies,
        complaints,
        assets,
      },
      counts: {
        emergencies: emergencies.length,
        complaints: complaints.length,
        assets: assets.length,
      },
    });
  } catch (error) {
    console.error("GIS DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load GIS dashboard data.",
    });
  }
});

router.get("/gis", async (req, res) => {
  try {
    const [emergencies, complaints, assets] = await Promise.all([
      Emergency.find({}).sort({ createdAt: -1 }).lean(),
      Complaint.find({}).sort({ createdAt: -1 }).lean(),
      Asset.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: { emergencies, complaints, assets },
    });
  } catch (error) {
    console.error("GIS DASHBOARD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load GIS dashboard data.",
    });
  }
});
/* =========================================================
   ANALYTICS — GET ALL COMPLAINTS
========================================================= */

router.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("ADMIN ANALYTICS COMPLAINTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load complaints for analytics.",
    });
  }
});

/* =========================================================
   ANALYTICS — GET ALL DEPARTMENTS
========================================================= */

router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error("ADMIN ANALYTICS DEPARTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load departments for analytics.",
    });
  }
});
/* =========================================================
   AUDIT LOGS — GET LOGS WITH SEARCH AND FILTERS
========================================================= */

router.get("/audit-logs", async (req, res) => {
  try {
    const {
      search = "",
      action = "",
      module = "",
      status = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};

    if (action) filter.action = action;
    if (module) filter.module = module;
    if (status) filter.status = status;

    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { actorName: regex },
        { actorEmail: regex },
        { action: regex },
        { module: regex },
        { description: regex },
        { targetId: regex },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load audit logs.",
    });
  }
});

/* =========================================================
   AUDIT LOGS — SUMMARY STATISTICS
========================================================= */

router.get("/audit-logs/stats", async (req, res) => {
  try {
    const [total, successful, failed, today] = await Promise.all([
      AuditLog.countDocuments(),

      AuditLog.countDocuments({ status: "Success" }),

      AuditLog.countDocuments({ status: "Failed" }),

      AuditLog.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, successful, failed, today },
    });
  } catch (error) {
    console.error("AUDIT LOG STATS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load audit log statistics.",
    });
  }
});

/* =========================================================
   AUDIT LOGS — RECORD AN ADMIN ACTION
========================================================= */

router.post("/audit-logs", async (req, res) => {
  try {
    const {
      action,
      module,
      description,
      targetId = "",
      targetType = "",
      status = "Success",
      metadata = {},
    } = req.body;

    if (
      !action?.trim() ||
      !module?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Action, module, and description are required.",
      });
    }

    if (!["Success", "Failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audit log status.",
      });
    }

    const admin = req.user || req.admin || {};

    const log = await AuditLog.create({
      actor: admin._id || null,
      actorName: admin.name || admin.fullName || "Admin",
      actorEmail: admin.email || "",
      action: action.trim(),
      module: module.trim(),
      description: description.trim(),
      targetId: String(targetId || ""),
      targetType: String(targetType || ""),
      status,
      metadata:
        metadata && typeof metadata === "object" && !Array.isArray(metadata)
          ? metadata
          : {},
      ipAddress: req.ip || "",
    });

    res.status(201).json({
      success: true,
      message: "Audit log recorded successfully.",
      log,
    });
  } catch (error) {
    console.error("CREATE AUDIT LOG ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to record audit log.",
    });
  }
});
module.exports = router;

