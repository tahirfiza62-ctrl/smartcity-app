const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    requestId: {
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

    category: {
      type: String,
      required: true,
      enum: [
        "child-registration",
        "birth-certificate",
        "death-certificate",
        "marriage-certificate",
        "domicile-certificate",
        "residence-certificate",
        "character-certificate",
        "property-registration",
        "property-transfer",
        "property-record",
        "building-permit",
        "business-registration",
        "trade-license",
        "other",
      ],
    },

    serviceName: {
      type: String,
      required: true,
      trim: true,
    },

    // Department automatically assigned according to selected service
    department: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional individual officer assignment
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Processing",
        "Approved",
        "Rejected",
        "Completed",
        "Cancelled",
      ],
      default: "Submitted",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    departmentNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    attachment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

module.exports = ServiceRequest;