
require("dotenv").config();

const mongoose = require("mongoose");
const Department = require("./models/Department");

const departments = [
  {
    name: "Citizen Registration Department",
    description: "Manages citizen registration and records.",
  },
  {
    name: "Land & Property Department",
    description: "Manages land, property records, and related services.",
  },
  {
    name: "Building & Planning Department",
    description: "Manages building permissions and city planning.",
  },
  {
    name: "Business & Licensing Department",
    description: "Handles business registrations and licenses.",
  },
  {
    name: "Citizen Services Department",
    description: "Coordinates public services and citizen requests.",
  },
  {
    name: "Municipal Department",
    description: "Manages municipal services and local facilities.",
  },
  {
    name: "Medical Department",
    description: "Coordinates public health and medical services.",
  },
  {
    name: "Garbage & Waste",
    description: "Manages garbage collection and waste disposal.",
  },
  {
    name: "Water Supply",
    description: "Manages water supply and related complaints.",
  },
  {
    name: "Sewerage",
    description: "Handles sewerage systems and drainage issues.",
  },
  {
    name: "Public Transport",
    description: "Coordinates public transportation services.",
  },
  {
    name: "Traffic Signals",
    description: "Manages traffic signals and related issues.",
  },
  {
    name: "Emergency",
    description: "Coordinates emergency service requests.",
  },
  {
    name: "Other",
    description: "Handles requests that do not fit other departments.",
  },
];

async function seedDepartments() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    for (const item of departments) {
      await Department.findOneAndUpdate(
        { name: item.name },
        {
          $set: {
            ...item,
            status: "Active",
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`Ready: ${item.name}`);
    }

    console.log("Department records created or updated.");
  } catch (error) {
    console.error("SEED DEPARTMENTS ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

seedDepartments();