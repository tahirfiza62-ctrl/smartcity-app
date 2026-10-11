const mongoose = require("mongoose");
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 500,
    },
    headName: { type: String, trim: true, default: "", maxlength: 100 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
     match: [
  /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  "Please enter a valid email address",
],
    },
    phone: { type: String, trim: true, default: "", maxlength: 20 },
    location: { type: String, trim: true, default: "", maxlength: 150 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Department", departmentSchema);
