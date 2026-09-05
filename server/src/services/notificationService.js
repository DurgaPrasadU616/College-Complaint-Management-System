const Notification = require("../models/Notification");
const { NOTIFICATION_TYPES } = require("../models/Notification");

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const createNotification = async ({ owner, complaintId, type, title, message }) => {
  try {
    return await Notification.create({ owner, complaintId, type, title, message });
  } catch (_) {
    return null;
  }
};

const notifyComplaintSubmitted = async (complaint, studentName) => {
  const admins = await require("../models/User").find({ role: "admin" }).select("_id");
  const notifications = admins.map((admin) => ({
    owner: admin._id,
    complaintId: complaint._id,
    type: NOTIFICATION_TYPES.NEW_COMPLAINT,
    title: "New Complaint Submitted",
    message: `${studentName} submitted a new complaint "${complaint.title}" in ${complaint.category}.`,
  }));
  try {
    await Notification.insertMany(notifications, { ordered: false });
  } catch (_) {}
};

const notifyComplaintAssigned = async (complaint, assignedStaff, department) => {
  const tasks = [];

  tasks.push(
    createNotification({
      owner: complaint.submittedBy,
      complaintId: complaint._id,
      type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
      title: "Complaint Assigned",
      message: `Your complaint "${complaint.title}" has been assigned to the ${department || "support"} team.`,
    })
  );

  if (assignedStaff) {
    tasks.push(
      createNotification({
        owner: assignedStaff,
        complaintId: complaint._id,
        type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
        title: "Complaint Assigned to You",
        message: `A complaint "${complaint.title}" has been assigned to you in the ${department || "support"} department.`,
      })
    );
  }

  await Promise.all(tasks);
};

const notifyComplaintReassigned = async (complaint, previousStaffId, newStaff, department) => {
  const tasks = [];

  tasks.push(
    createNotification({
      owner: complaint.submittedBy,
      complaintId: complaint._id,
      type: NOTIFICATION_TYPES.COMPLAINT_REASSIGNED,
      title: "Complaint Reassigned",
      message: `Your complaint "${complaint.title}" has been reassigned to the ${department || "support"} team.`,
    })
  );

  if (previousStaffId) {
    tasks.push(
      createNotification({
        owner: previousStaffId,
        complaintId: complaint._id,
        type: NOTIFICATION_TYPES.COMPLAINT_REASSIGNED,
        title: "Complaint Reassigned",
        message: `A complaint "${complaint.title}" has been reassigned to another staff member.`,
      })
    );
  }

  if (newStaff) {
    tasks.push(
      createNotification({
        owner: newStaff,
        complaintId: complaint._id,
        type: NOTIFICATION_TYPES.COMPLAINT_REASSIGNED,
        title: "Complaint Assigned to You",
        message: `A complaint "${complaint.title}" has been reassigned to you in the ${department || "support"} department.`,
      })
    );
  }

  await Promise.all(tasks);
};

const notifyStatusChanged = async (complaint, previousStatus, newStatus, comment) => {
  const label = STATUS_LABELS[newStatus] || newStatus;
  const type =
    newStatus === "resolved"
      ? NOTIFICATION_TYPES.COMPLAINT_RESOLVED
      : newStatus === "closed"
        ? NOTIFICATION_TYPES.COMPLAINT_CLOSED
        : NOTIFICATION_TYPES.STATUS_CHANGED;

  const title =
    newStatus === "resolved"
      ? "Complaint Resolved"
      : newStatus === "closed"
        ? "Complaint Closed"
        : "Complaint Status Updated";

  const message = `Your complaint "${complaint.title}" is now ${label}${comment ? ` — ${comment}` : ""}.`;

  await createNotification({
    owner: complaint.submittedBy,
    complaintId: complaint._id,
    type,
    title,
    message,
  });
};

const notifyNewComment = async (complaint, commenter, comment) => {
  const isStudentComment = commenter.role === "student";

  if (isStudentComment && complaint.assignedTo) {
    await createNotification({
      owner: complaint.assignedTo,
      complaintId: complaint._id,
      type: NOTIFICATION_TYPES.NEW_COMMENT,
      title: "New Comment",
      message: `A student added a comment to complaint "${complaint.title}".`,
    });
  }

  if (!isStudentComment) {
    await createNotification({
      owner: complaint.submittedBy,
      complaintId: complaint._id,
      type: NOTIFICATION_TYPES.NEW_COMMENT,
      title: "New Comment",
      message: `A staff member added a comment to your complaint "${complaint.title}".`,
    });
  }
};

const notifyFeedbackReceived = async (complaint, adminId, rating) => {
  if (!adminId) return;
  await createNotification({
    owner: adminId,
    complaintId: complaint._id,
    type: NOTIFICATION_TYPES.FEEDBACK_RECEIVED,
    title: "Feedback Received",
    message: `A student left a ${rating}-star rating for complaint "${complaint.title}".`,
  });
};

const getNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find({ owner: userId })
      .populate("complaintId", "title status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ owner: userId }),
  ]);
  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ owner: userId, isRead: false });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, owner: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { owner: userId, isRead: false },
    { isRead: true }
  );
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    owner: userId,
  });
  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }
  return notification;
};

module.exports = {
  createNotification,
  notifyComplaintSubmitted,
  notifyComplaintAssigned,
  notifyComplaintReassigned,
  notifyStatusChanged,
  notifyNewComment,
  notifyFeedbackReceived,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
