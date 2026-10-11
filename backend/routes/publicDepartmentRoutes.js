
const express = require("express");
const Department = require("../models/Department");

const router = express.Router();

// GET /api/departments/active
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

module.exports = router;