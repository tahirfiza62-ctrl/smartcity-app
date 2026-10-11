
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Asset = require("../models/Asset");
const authMiddleware = require("../middleware/authMiddleware");

/* =========================================================
   CONSTANTS
========================================================= */

const CATEGORIES = [
  "Street Light",
  "Waste Bin",
  "Road",
  "Water Supply",
  "Public Park",
  "Vehicle",
  "Equipment",
  "Other",
];

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

const STATUSES = [
  "Available",
  "Assigned",
  "Under Maintenance",
  "Retired",
];

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

  if (!req.user?.department?.trim()) {
    return res.status(403).json({
      success: false,
      message: "A department must be assigned to your account.",
    });
  }

  next();
};

/* =========================================================
   HELPERS
========================================================= */

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const validateText = (value, field, maxLength) => {
  if (typeof value !== "string" || !value.trim()) {
    return `${field} is required.`;
  }

  if (value.trim().length > maxLength) {
    return `${field} cannot exceed ${maxLength} characters.`;
  }

  return null;
};

const normalizeDepartment = (value) =>
  String(value || "").trim();

const validateOptionalDate = (value) => {
  if (value === "" || value === null || value === undefined) {
    return { valid: true, value: null };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { valid: false };
  }

  if (date.getTime() > Date.now()) {
    return { valid: false };
  }

  return { valid: true, value: date };
};

/* =========================================================
   GET DEPARTMENT ASSETS
   GET /api/assets
========================================================= */

router.get(
  "/",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = normalizeDepartment(
        req.user.department
      );

      const assets = await Asset.find({
        department,
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: assets.length,
        assets,
      });
    } catch (error) {
      console.error("GET ASSETS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch assets.",
      });
    }
  }
);

/* =========================================================
   GET SINGLE DEPARTMENT ASSET
   GET /api/assets/:id
========================================================= */

router.get(
  "/:id",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset ID.",
        });
      }

      const asset = await Asset.findOne({
        _id: id,
        department: normalizeDepartment(req.user.department),
      }).lean();

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
      console.error("GET ASSET DETAILS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch asset details.",
      });
    }
  }
);

/* =========================================================
   CREATE ASSET
   POST /api/assets
========================================================= */

router.post(
  "/",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const department = normalizeDepartment(
        req.user.department
      );

      const {
        name,
        type,
        category,
        location,
        condition,
        status,
        description,
        purchaseDate,
        purchaseCost,
      } = req.body;

      const assetType = category || type;

      /* ---------------- VALIDATION ---------------- */

      const nameError = validateText(name, "Asset name", 120);

      if (nameError) {
        return res.status(400).json({
          success: false,
          message: nameError,
        });
      }

      if (
        typeof assetType !== "string" ||
        !CATEGORIES.includes(assetType.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid asset category.",
        });
      }

      const locationError = validateText(
        location,
        "Asset location",
        200
      );

      if (locationError) {
        return res.status(400).json({
          success: false,
          message: locationError,
        });
      }

      if (
        condition !== undefined &&
        !CONDITIONS.includes(condition)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset condition.",
        });
      }

      if (
        status !== undefined &&
        !STATUSES.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset status.",
        });
      }

      if (
        description !== undefined &&
        (typeof description !== "string" ||
          description.length > 1000)
      ) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 1000 characters.",
        });
      }

      const cost =
        purchaseCost === "" ||
        purchaseCost === null ||
        purchaseCost === undefined
          ? 0
          : Number(purchaseCost);

      if (!Number.isFinite(cost) || cost < 0) {
        return res.status(400).json({
          success: false,
          message: "Purchase cost must be a valid non-negative number.",
        });
      }

      const parsedDate = validateOptionalDate(purchaseDate);

      if (!parsedDate.valid) {
        return res.status(400).json({
          success: false,
          message: "Purchase date must be valid and cannot be in the future.",
        });
      }

      /* ---------------- GENERATE ASSET ID ---------------- */

      // A counter collection is safer than calculating the next ID
      // from the most recently created asset.
      const year = new Date().getFullYear();
      const prefix = `AST-${year}-`;

      let assetId;
      let createdAsset;

      // Retry on the extremely unlikely event of a duplicate key.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const lastAsset = await Asset.findOne({
          assetId: new RegExp(`^AST-${year}-\\d+$`),
        })
          .sort({ assetId: -1 })
          .select("assetId")
          .lean();

        const lastNumber = lastAsset
          ? Number(lastAsset.assetId.split("-").pop())
          : 0;

        const nextNumber = lastNumber + 1;

        assetId = `${prefix}${String(nextNumber).padStart(4, "0")}`;

        try {
          createdAsset = await Asset.create({
            assetId,
            name: name.trim(),
            category: assetType.trim(),
            type: assetType.trim(),
            department,
            location: location.trim(),
            condition: condition || "Good",
            status: status || "Available",
            description: description?.trim() || "",
            purchaseDate: parsedDate.value,
            purchaseCost: cost,
          });

          break;
        } catch (error) {
          if (error.code !== 11000 || attempt === 2) {
            throw error;
          }
        }
      }

      if (!createdAsset) {
        return res.status(500).json({
          success: false,
          message: "Could not generate a unique asset ID. Please try again.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Asset created successfully.",
        asset: createdAsset,
      });
    } catch (error) {
      console.error("CREATE ASSET ERROR:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An asset with this ID already exists.",
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to create asset.",
      });
    }
  }
);

/* =========================================================
   UPDATE ASSET
   PATCH /api/assets/:id
========================================================= */

router.patch(
  "/:id",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset ID.",
        });
      }

      const department = normalizeDepartment(
        req.user.department
      );

      const asset = await Asset.findOne({
        _id: id,
        department,
      });

      if (!asset) {
        return res.status(404).json({
          success: false,
          message: "Asset not found.",
        });
      }

      const {
        name,
        type,
        category,
        location,
        condition,
        status,
        description,
        purchaseDate,
        purchaseCost,
      } = req.body;

      const assetType = category ?? type;

      if (name !== undefined) {
        const error = validateText(name, "Asset name", 120);

        if (error) {
          return res.status(400).json({
            success: false,
            message: error,
          });
        }

        asset.name = name.trim();
      }

      if (assetType !== undefined) {
        if (
          typeof assetType !== "string" ||
          !CATEGORIES.includes(assetType.trim())
        ) {
          return res.status(400).json({
            success: false,
            message: "Please select a valid asset category.",
          });
        }

        asset.category = assetType.trim();
        asset.type = assetType.trim();
      }

      if (location !== undefined) {
        const error = validateText(
          location,
          "Asset location",
          200
        );

        if (error) {
          return res.status(400).json({
            success: false,
            message: error,
          });
        }

        asset.location = location.trim();
      }

      if (condition !== undefined) {
        if (!CONDITIONS.includes(condition)) {
          return res.status(400).json({
            success: false,
            message: "Invalid asset condition.",
          });
        }

        asset.condition = condition;
      }

      if (status !== undefined) {
        if (!STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid asset status.",
          });
        }

        asset.status = status;
      }

      if (description !== undefined) {
        if (
          typeof description !== "string" ||
          description.length > 1000
        ) {
          return res.status(400).json({
            success: false,
            message: "Description cannot exceed 1000 characters.",
          });
        }

        asset.description = description.trim();
      }

      if (purchaseDate !== undefined) {
        const parsedDate = validateOptionalDate(purchaseDate);

        if (!parsedDate.valid) {
          return res.status(400).json({
            success: false,
            message: "Purchase date must be valid and cannot be in the future.",
          });
        }

        asset.purchaseDate = parsedDate.value;
      }

      if (purchaseCost !== undefined) {
        const cost =
          purchaseCost === "" || purchaseCost === null
            ? 0
            : Number(purchaseCost);

        if (!Number.isFinite(cost) || cost < 0) {
          return res.status(400).json({
            success: false,
            message: "Purchase cost must be a valid non-negative number.",
          });
        }

        asset.purchaseCost = cost;
      }

      // assetId and department are deliberately not editable here.
      await asset.save();

      return res.status(200).json({
        success: true,
        message: "Asset updated successfully.",
        asset,
      });
    } catch (error) {
      console.error("UPDATE ASSET ERROR:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update asset.",
      });
    }
  }
);

/* =========================================================
   DELETE ASSET
   DELETE /api/assets/:id
========================================================= */

router.delete(
  "/:id",
  authMiddleware,
  departmentOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset ID.",
        });
      }

      const asset = await Asset.findOneAndDelete({
        _id: id,
        department: normalizeDepartment(req.user.department),
      });

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
      console.error("DELETE ASSET ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete asset.",
      });
    }
  }
);

module.exports = router;