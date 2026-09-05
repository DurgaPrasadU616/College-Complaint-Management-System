const Complaint = require("../models/Complaint");
const User = require("../models/User");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      total,
      byStatus,
      byCategory,
      byPriority,
      open,
      resolved,
      closed,
      unassigned,
      urgent,
      byDepartment,
      recentComplaints,
      staffWorkload,
    ] = await Promise.all([
      Complaint.countDocuments(),

      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

      Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),

      Complaint.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),

      Complaint.countDocuments({
        status: { $in: ["submitted", "under_review", "assigned", "in_progress"] },
      }),

      Complaint.countDocuments({ status: "resolved" }),

      Complaint.countDocuments({ status: "closed" }),

      Complaint.countDocuments({
        assignedTo: null,
        status: { $in: ["submitted", "under_review"] },
      }),

      Complaint.find({ priority: { $in: ["high", "critical"] } })
        .select("title category priority status assignedTo createdAt")
        .populate("assignedTo", "name")
        .sort({ createdAt: -1 })
        .limit(10),

      Complaint.aggregate([
        { $match: { assignedDepartment: { $ne: null } } },
        { $group: { _id: "$assignedDepartment", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Complaint.find()
        .select("title category status priority createdAt")
        .populate("submittedBy", "name")
        .sort({ createdAt: -1 })
        .limit(8),

      Complaint.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        {
          $group: {
            _id: "$assignedTo",
            total: { $sum: 1 },
            open: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$status",
                      ["submitted", "under_review", "assigned", "in_progress"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            resolved: {
              $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
            },
            closed: {
              $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "staff",
          },
        },
        { $unwind: "$staff" },
        {
          $project: {
            _id: 1,
            name: "$staff.name",
            email: "$staff.email",
            total: 1,
            open: 1,
            resolved: 1,
            closed: 1,
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      total,
      open,
      resolved,
      closed,
      unassigned,
      byStatus,
      byCategory,
      byPriority,
      byDepartment,
      recentComplaints,
      urgent,
      staffWorkload,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [total, byStatus, byCategory, open, resolved, closed] = await Promise.all([
      Complaint.countDocuments({ submittedBy: userId }),

      Complaint.aggregate([
        { $match: { submittedBy: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Complaint.aggregate([
        { $match: { submittedBy: req.user._id } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),

      Complaint.countDocuments({
        submittedBy: userId,
        status: { $in: ["submitted", "under_review", "assigned", "in_progress"] },
      }),

      Complaint.countDocuments({
        submittedBy: userId,
        status: "resolved",
      }),

      Complaint.countDocuments({
        submittedBy: userId,
        status: "closed",
      }),
    ]);

    res.json({ total, open, resolved, closed, byStatus, byCategory });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getStudentStats };
