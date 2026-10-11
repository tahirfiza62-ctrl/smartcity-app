
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actorName: {
      type: String,
      default: "System",
      trim: true,
    },

    actorEmail: {
      type: String,
      default: "",
      trim: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    module: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    targetId: {
      type: String,
      default: "",
      trim: true,
    },

    targetType: {
      type: String,
      default: "",
      trim: true,
    },

    ipAddress: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, module: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

