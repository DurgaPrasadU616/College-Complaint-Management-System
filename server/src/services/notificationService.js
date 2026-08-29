const Notification = require("../models/Notification");

const getNotifications = async (userId) => {
  return Notification.find({ owner: userId })
    .populate("complaintId", "title")
    .sort({ createdAt: -1 });
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

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
