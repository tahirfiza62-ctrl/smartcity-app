const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const departments = [
  {
    fullName: "Citizen Registration Officer",
    email: "registration@civicconnect.com",
    password: "Registration@123",
    department: "Citizen Registration Department",
  },

  {
    fullName: "Land & Property Officer",
    email: "property@civicconnect.com",
    password: "Property@123",
    department: "Land & Property Department",
  },

  {
    fullName: "Building & Planning Officer",
    email: "building@civicconnect.com",
    password: "Building@123",
    department: "Building & Planning Department",
  },

  {
    fullName: "Business & Licensing Officer",
    email: "business@civicconnect.com",
    password: "Business@123",
    department: "Business & Licensing Department",
  },

  {
    fullName: "Citizen Services Officer",
    email: "services@civicconnect.com",
    password: "Services@123",
    department: "Citizen Services Department",
  },

  {
    fullName: "Municipal Department Officer",
    email: "municipal@civicconnect.com",
    password: "Municipal@123",
    department: "Municipal Department",
  },

  {
    fullName: "Medical Department Officer",
    email: "medical@civicconnect.com",
    password: "Medical@123",
    department: "Medical Department",
  },

  {
    fullName: "Garbage & Waste Officer",
    email: "garbage@civicconnect.com",
    password: "Garbage@123",
    department: "Garbage & Waste",
  },

  {
    fullName: "Water Supply Officer",
    email: "water@civicconnect.com",
    password: "Water@123",
    department: "Water Supply",
  },

  {
    fullName: "Sewerage Officer",
    email: "sewerage@civicconnect.com",
    password: "Sewerage@123",
    department: "Sewerage",
  },

  {
    fullName: "Public Transport Officer",
    email: "transport@civicconnect.com",
    password: "Transport@123",
    department: "Public Transport",
  },

  {
    fullName: "Traffic Signals Officer",
    email: "traffic@civicconnect.com",
    password: "Traffic@123",
    department: "Traffic Signals",
  },

  {
    fullName: "Emergency Department Officer",
    email: "emergency@civicconnect.com",
    password: "Emergency@123",
    department: "Emergency",
  },

  {
    fullName: "Other Services Officer",
    email: "other@civicconnect.com",
    password: "Other@123",
    department: "Other",
  },
];
const createDepartmentUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");
    console.log("Creating department accounts...\n");

    for (const officer of departments) {
      const existingUser = await User.findOne({
        email: officer.email,
      });

      const hashedPassword = await bcrypt.hash(
        officer.password,
        10
      );

      if (existingUser) {
        existingUser.fullName = officer.fullName;
        existingUser.password = hashedPassword;
        existingUser.role = "department";
        existingUser.department = officer.department;
        existingUser.authProvider = "local";
        existingUser.status = "active";

        await existingUser.save();

        console.log(
          `UPDATED: ${officer.email} → ${officer.department}`
        );
      } else {
        await User.create({
          fullName: officer.fullName,
          email: officer.email,
          password: hashedPassword,
          authProvider: "local",
          role: "department",
          department: officer.department,
          status: "active",
        });

        console.log(
          `CREATED: ${officer.email} → ${officer.department}`
        );
      }
    }

    console.log("\n========================================");
    console.log("DEPARTMENT ACCOUNTS READY");
    console.log("========================================\n");

    departments.forEach((officer) => {
      console.log(`Department: ${officer.department}`);
      console.log(`Email:      ${officer.email}`);
      console.log(`Password:   ${officer.password}`);
      console.log("----------------------------------------");
    });

    await mongoose.connection.close();

    console.log("\nMongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("\nERROR:", error);
    process.exit(1);
  }
};

createDepartmentUsers();