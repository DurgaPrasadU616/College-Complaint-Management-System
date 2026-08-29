const mongoose = require("mongoose");

const complaintUpdateSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      enum: ["student", "admin"],
      required: true,
    },
    previousStatus: {
      type: String,
      enum: ["submitted", "under_review", "assigned", "in_progress", "resolved", "closed"],
    },
    newStatus: {
      type: String,
      enum: ["submitted", "under_review", "assigned", "in_progress", "resolved", "closed"],
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ComplaintUpdate", complaintUpdateSchema);
