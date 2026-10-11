const express = require("express");
const mongoose = require("mongoose");

const Emergency = require("../models/Emergency");
const User = require("../models/User");
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
   GENERATE EMERGENCY ID
========================================================= */

const generateEmergencyId = async () => {
  const year = new Date().getFullYear();

  const lastEmergency = await Emergency.findOne({
    emergencyId: new RegExp(`^EMG-${year}-`),
  }).sort({ createdAt: -1 });

  let number = 1;

  if (lastEmergency?.emergencyId) {
    const parts = lastEmergency.emergencyId.split("-");
    const lastNumber = parseInt(parts[2], 10);

    if (!isNaN(lastNumber)) {
      number = lastNumber + 1;
    }
  }

  return `EMG-${year}-${String(number).padStart(4, "0")}`;
};

/* =========================================================
   DEPARTMENT
   GET ALL EMERGENCIES
========================================================= */

router.get("/", authMiddleware, departmentOnly, async (req, res) => {
  try {
    const emergencies = await Emergency.find({
      department: req.user.department,
    })
      .populate("citizen", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      emergencies,
    });
  } catch (error) {
    console.error("GET EMERGENCIES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch emergencies",
      error: error.message,
    });
  }
});

/* =========================================================
   DEPARTMENT
   GET SINGLE EMERGENCY
========================================================= */

router.get("/:id", authMiddleware, departmentOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency ID",
      });
    }

    const emergency = await Emergency.findOne({
      _id: req.params.id,
      department: req.user.department,
    }).populate("citizen", "fullName email");

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    res.status(200).json({
      success: true,
      emergency,
    });
  } catch (error) {
    console.error("GET SINGLE EMERGENCY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch emergency",
      error: error.message,
    });
  }
});

/* =========================================================
   DEPARTMENT
   UPDATE EMERGENCY
========================================================= */

router.patch("/:id", authMiddleware, departmentOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency ID",
      });
    }

    const emergency = await Emergency.findOne({
      _id: req.params.id,
      department: req.user.department,
    });

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    const {
      status,
      severity,
      responseTeam,
      responseNotes,
    } = req.body;

    if (status !== undefined) {
      emergency.status = status;
    }

    if (severity !== undefined) {
      emergency.severity = severity;
    }

    if (responseTeam !== undefined) {
      emergency.responseTeam = String(responseTeam).trim();
    }

    if (responseNotes !== undefined) {
      emergency.responseNotes = String(responseNotes).trim();
    }

    await emergency.save();

    res.status(200).json({
      success: true,
      message: "Emergency updated successfully",
      emergency,
    });
  } catch (error) {
    console.error("UPDATE EMERGENCY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update emergency",
      error: error.message,
    });
  }
});

/* =========================================================
   CITIZEN
   REPORT EMERGENCY
========================================================= */

router.post("/report", authMiddleware, async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId).select(
      "fullName email role status"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can report emergencies",
      });
    }

    const {
      title,
      type,
      location,
      severity,
      description,
    } = req.body;

    if (!title || !type || !location || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Title, type, location and description are required",
      });
    }

    /* =====================================================
       AUTOMATIC DEPARTMENT ASSIGNMENT
    ===================================================== */

    const departmentMap = {
      "Medical Emergency": "Medical Department",
      "Fire Emergency": "Emergency",
      "Traffic Accident": "Traffic Signals",
      "Public Safety": "Emergency",
      "Water Emergency": "Water Supply",
      "Sewerage Emergency": "Sewerage",
      "Infrastructure Failure": "Municipal Department",
      Other: "Other",
    };

    const department = departmentMap[type] || "Other";

    const emergencyId = await generateEmergencyId();

    const emergency = await Emergency.create({
      emergencyId,

      citizen: user._id,

      citizenName: user.fullName,

      citizenEmail: user.email,

      title: title.trim(),

      type,

      department,

      location: location.trim(),

      severity: severity || "Medium",

      status: "Reported",

      description: description.trim(),

      responseTeam: "",

      responseNotes: "",
    });

    res.status(201).json({
      success: true,
      message: "Emergency reported successfully",
      emergency,
    });
  } catch (error) {
    console.error("REPORT EMERGENCY ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to report emergency",
      error: error.message,
    });
  }
});

/* =========================================================
   CITIZEN
   MY EMERGENCIES
========================================================= */

router.get("/citizen/my", authMiddleware, async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const emergencies = await Emergency.find({
      citizen: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      emergencies,
    });
  } catch (error) {
    console.error("GET CITIZEN EMERGENCIES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your emergencies",
      error: error.message,
    });
  }
});

module.exports = router;