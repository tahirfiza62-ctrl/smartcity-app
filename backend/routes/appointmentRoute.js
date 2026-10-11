
const express = require("express");
const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =========================================================
// GET LOGGED-IN CITIZEN APPOINTMENTS
// =========================================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const appointments = await Appointment.find({
      user: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      appointments,
    });

  } catch (error) {
    console.error("Get Appointments Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
    });
  }
});


// =========================================================
// BOOK APPOINTMENT
// =========================================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      department,
      appointmentDate,
      appointmentTime,
      purpose,
    } = req.body;

    if (
      !department ||
      !appointmentDate ||
      !appointmentTime ||
      !purpose
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const appointment = await Appointment.create({
      user: userId,
      department,
      appointmentDate,
      appointmentTime,
      purpose,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      appointment,
    });

  } catch (error) {
    console.error("Create Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to book appointment.",
    });
  }
});


// =========================================================
// GET SINGLE APPOINTMENT
// =========================================================

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });

  } catch (error) {
    console.error("Get Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment.",
    });
  }
});


// =========================================================
// UPDATE APPOINTMENT STATUS
// =========================================================

router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status.",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated.",
      appointment,
    });

  } catch (error) {
    console.error("Update Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update appointment status.",
    });
  }
});


// =========================================================
// DELETE APPOINTMENT
// =========================================================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete appointment.",
    });
  }
});


module.exports = router;

