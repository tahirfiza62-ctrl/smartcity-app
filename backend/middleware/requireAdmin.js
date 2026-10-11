
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication token is required.",
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from backend .env");
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "The authentication token has no user ID.",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The account associated with this token was not found.",
      });
    }

    if (String(user.status || "").toLowerCase() !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact the administrator.",
      });
    }

    if (!["admin", "administrator"].includes(
      String(user.role || "").toLowerCase()
    )) {
      return res.status(403).json({
        success: false,
        message: "Access denied. An administrator account is required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("ADMIN AUTH MIDDLEWARE ERROR:", error.message);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired admin token. Please log in again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator access.",
    });
  }
};

module.exports = requireAdmin;