
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const ADMIN_EMAIL = "admin@smartcity.local";
const ADMIN_PASSWORD = "CityAdmin#2026!";

async function resetAdmin() {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URL;

    if (!mongoUri) {
      throw new Error("MongoDB connection URL is missing from .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    await mongoose.connect(mongoUri);

    let admin = await User.findOne({ email: ADMIN_EMAIL });

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (admin) {
      if (admin.role !== "admin") {
        throw new Error(
          "This email belongs to a non-admin account. No changes made."
        );
      }

      admin.password = hashedPassword;
      admin.status = "active";
      admin.authProvider = "local";

      await admin.save();

      console.log("Existing admin password has been reset.");
    } else {
      admin = await User.create({
        fullName: "Smart City Administrator",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        authProvider: "local",
        role: "admin",
        department: null,
        status: "active",
      });

      console.log("Admin account created successfully.");
    }

    console.log("Admin email:", ADMIN_EMAIL);
    console.log("Admin password:", ADMIN_PASSWORD);
  } catch (error) {
    console.error("ADMIN SETUP ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

resetAdmin();