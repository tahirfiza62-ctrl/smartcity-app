
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    /* =====================================================
       COMPLAINT ID
    ===================================================== */

    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

category: {
  type: String,
  required: true,
  trim: true,
},

departmentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
  required: true,
  index: true,
},

department: {
  type: String,
  required: true,
  trim: true,
},
    /* =====================================================
       CITIZEN
    ===================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    citizenId: {
      type: String,
      required: true,
      trim: true,
    },

    citizenName: {
      type: String,
      required: true,
      trim: true,
    },

    citizenEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /* =====================================================
       COMPLAINT CATEGORY
    ===================================================== */

   category: {
  type: String,
  required: [true, "Complaint category is required."],
  trim: true,
},

    /* =====================================================
       DEPARTMENT
    ===================================================== */

   department: {
  type: String,
  required: [true, "Department is required."],
  trim: true,
},
    /* =====================================================
       SUBJECT
    ===================================================== */

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================================================
       DESCRIPTION
    ===================================================== */

    description: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================================================
       LOCATION
    ===================================================== */

    location: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================================================
       PRIORITY
    ===================================================== */

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
      ],
      default: "Medium",
    },

    /* =====================================================
       STATUS
    ===================================================== */

    status: {
      type: String,
      enum: [
        "Submitted",
        "Pending",
        "Under Review",
        "In Progress",
        "Resolved",
        "Rejected",
        "Closed",
      ],
      default: "Submitted",
    },

    /* =====================================================
       DEPARTMENT RESPONSE
    ===================================================== */

    departmentResponse: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       RESOLUTION
    ===================================================== */

    resolution: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Complaint",
  complaintSchema
);

