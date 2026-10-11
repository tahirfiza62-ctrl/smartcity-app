
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const officers = [
  {
    fullName: "Municipal Department Officer",
    email: "municipal@civicconnect.com",
    password: "municipal123",
    department: "Municipal Department",
  },
  {
    fullName: "Medical Department Officer",
    email: "medical@civicconnect.com",
    password: "medical123",
    department: "Medical Department",
  },
  {
    fullName: "Garbage & Waste Officer",
    email: "garbage@civicconnect.com",
    password: "garbage123",
    department: "Garbage & Waste",
  },
  {
    fullName: "Water Supply Officer",
    email: "water@civicconnect.com",
    password: "water123",
    department: "Water Supply",
  },
  {
    fullName: "Sewerage Officer",
    email: "sewerage@civicconnect.com",
    password: "sewerage123",
    department: "Sewerage",
  },
  {
    fullName: "Public Transport Officer",
    email: "transport@civicconnect.com",
    password: "transport123",
    department: "Public Transport",
  },
  {
    fullName: "Traffic Signals Officer",
    email: "traffic@civicconnect.com",
    password: "traffic123",
    department: "Traffic Signals",
  },
  {
    fullName: "Emergency Department Officer",
    email: "emergency@civicconnect.com",
    password: "emergency123",
    department: "Emergency",
  },
  {
    fullName: "Other Department Officer",
    email: "other@civicconnect.com",
    password: "other123",
    department: "Other",
  },
];

const createOfficers = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");
    console.log(
      "Database:",
      mongoose.connection.name
    );

    for (const officer of officers) {
      const hashedPassword = await bcrypt.hash(
        officer.password,
        10
      );

      const user = await User.findOneAndUpdate(
        {
          email: officer.email,
        },
        {
          fullName: officer.fullName,
          email: officer.email,
          password: hashedPassword,
          authProvider: "local",
          role: "department",
          department: officer.department,
          status: "active",
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(
        `READY: ${user.email} | ${user.department} | ${user.role}`
      );
    }

    console.log("\nAll department officers are ready.");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "CREATE OFFICERS ERROR:",
      error
    );

    process.exit(1);
  }
};

createOfficers();

