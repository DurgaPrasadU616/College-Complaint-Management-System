const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Classroom",
        "Lab",
        "Hostel",
        "Wi-Fi/Network",
        "Infrastructure",
        "Transportation",
        "Cleanliness",
        "Other",
      ],
    },
    location: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["submitted", "under_review", "assigned", "in_progress", "resolved", "closed"],
      default: "submitted",
    },
    attachments: [
      {
        url: String,
        filename: String,
        mimeType: String,
      },
    ],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedDepartment: {
      type: String,
      trim: true,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolutionDetails: {
      type: String,
      default: null,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      submittedAt: {
        type: Date,
      },
    },
    ai: {
      category: { type: String, default: null },
      priority: { type: String, default: null },
      summary: { type: String, default: null },
      tags: [{ type: String }],
      model: { type: String, default: null },
      analyzedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

complaintSchema.index({ submittedBy: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ assignedDepartment: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
