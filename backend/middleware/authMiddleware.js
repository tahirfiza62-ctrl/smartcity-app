
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    console.log("\n========== AUTH CHECK ==========");

    console.log("Request URL:", req.originalUrl);
    console.log("Request Method:", req.method);
    console.log(
      "Authorization Header:",
      req.headers.authorization
    );

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ NO AUTHORIZATION HEADER");

      return res.status(401).json({
        success: false,
        message: "Authorization token is missing.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("❌ INVALID AUTHORIZATION FORMAT");

      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      console.log("❌ EMPTY TOKEN");

      return res.status(401).json({
        success: false,
        message: "Token is missing.",
      });
    }

    console.log("✅ TOKEN RECEIVED");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("✅ TOKEN VERIFIED");
    console.log("Decoded User:", decoded);

    req.user = decoded;

    next();

  } catch (error) {
    console.error(
      "❌ AUTH ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;

