const mongoose = require("mongoose");

const NOTIFICATION_TYPES = {
  COMPLAINT_SUBMITTED: "COMPLAINT_SUBMITTED",
  COMPLAINT_ASSIGNED: "COMPLAINT_ASSIGNED",
  COMPLAINT_REASSIGNED: "COMPLAINT_REASSIGNED",
  STATUS_CHANGED: "STATUS_CHANGED",
  NEW_COMMENT: "NEW_COMMENT",
  COMPLAINT_RESOLVED: "COMPLAINT_RESOLVED",
  COMPLAINT_CLOSED: "COMPLAINT_CLOSED",
  FEEDBACK_RECEIVED: "FEEDBACK_RECEIVED",
  NEW_COMPLAINT: "NEW_COMPLAINT",
};

const notificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(NOTIFICATION_TYPES),
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ owner: 1, isRead: 1 });
notificationSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
