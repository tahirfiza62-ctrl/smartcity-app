const User = require("../models/User");


// ==========================================
// CITIZEN DASHBOARD
// ==========================================

const getCitizenDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Citizen account not found.",
      });
    }

    // These will later come from Complaint,
    // ServiceRequest, Appointment and Notification models.

    const statistics = {
      totalComplaints: 0,
      pendingComplaints: 0,
      resolvedComplaints: 0,
      totalServiceRequests: 0,
    };

    const recentComplaints = [];

    const serviceRequests = [];

    const appointments = [];

    const notifications = [];

    res.status(200).json({
      success: true,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },

      statistics,

      recentComplaints,

      serviceRequests,

      appointments,

      notifications,
    });
  } catch (error) {
    console.error("CITIZEN DASHBOARD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load citizen dashboard.",
    });
  }
};


module.exports = {
  getCitizenDashboard,
};