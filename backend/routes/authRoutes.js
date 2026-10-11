
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Check that every route handler exists before registering routes.
const requiredHandlers = [
  "register",
  "login",
  "departmentLogin",
  "adminLogin",
  "getMe",
];

for (const handlerName of requiredHandlers) {
  if (typeof authController[handlerName] !== "function") {
    throw new Error(
      `authController.${handlerName} is missing or is not a function. ` +
      "Check backend/controllers/authController.js exports."
    );
  }
}

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/department-login", authController.departmentLogin);
router.post("/admin-login", authController.adminLogin);
router.get("/me", authController.getMe);

module.exports = router;