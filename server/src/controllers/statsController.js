const Complaint = require("../models/Complaint");

const getDashboardStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();

    const byStatus = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const byPriority = await Complaint.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const open = await Complaint.countDocuments({
      status: { $in: ["submitted", "under_review", "assigned", "in_progress"] },
    });

    const resolved = await Complaint.countDocuments({ status: "resolved" });
    const closed = await Complaint.countDocuments({ status: "closed" });

    const byDepartment = await Complaint.aggregate([
      { $match: { assignedDepartment: { $ne: null } } },
      { $group: { _id: "$assignedDepartment", count: { $sum: 1 } } },
    ]);

    const recentComplaints = await Complaint.find()
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      total,
      open,
      resolved,
      closed,
      byStatus,
      byCategory,
      byPriority,
      byDepartment,
      recentComplaints,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const total = await Complaint.countDocuments({ submittedBy: userId });

    const byStatus = await Complaint.aggregate([
      { $match: { submittedBy: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byCategory = await Complaint.aggregate([
      { $match: { submittedBy: req.user._id } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const open = await Complaint.countDocuments({
      submittedBy: userId,
      status: { $in: ["submitted", "under_review", "assigned", "in_progress"] },
    });

    const resolved = await Complaint.countDocuments({
      submittedBy: userId,
      status: "resolved",
    });

    const closed = await Complaint.countDocuments({
      submittedBy: userId,
      status: "closed",
    });

    res.json({ total, open, resolved, closed, byStatus, byCategory });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getStudentStats };
