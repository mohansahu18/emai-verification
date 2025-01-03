const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    jobId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    fileName: {
      type: String,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    verifiedCount: {
      type: Number,
      default: 0,
    },
    deliverableCount: {
      type: Number,
      default: 0,
    },
    undeliverableCount: {
      type: Number,
      default: 0,
    },
    acceptAllCount: {
      type: Number,
      default: 0,
    },
    unknownCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("List", listSchema);
