const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    emergencyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "Medical Emergency",
        "Fire Emergency",
        "Traffic Accident",
        "Public Safety",
        "Water Emergency",
        "Sewerage Emergency",
        "Infrastructure Failure",
        "Other",
      ],
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    reportedAt: {
      type: Date,
      default: Date.now,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Reported",
        "Assigned",
        "In Progress",
        "Resolved",
        "Cancelled",
      ],
      default: "Reported",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    responseTeam: {
      type: String,
      default: "",
      trim: true,
    },
latitude: {
  type: Number,
  min: -90,
  max: 90,
  default: null,
},

longitude: {
  type: Number,
  min: -180,
  max: 180,
  default: null,
},
    responseNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Emergency ||
  mongoose.model("Emergency", emergencySchema);