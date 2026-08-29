const Complaint = require("../models/Complaint");
const ComplaintUpdate = require("../models/ComplaintUpdate");
const Notification = require("../models/Notification");

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const notifyStudent = async (complaint, actorName, previousStatus, newStatus, comment) => {
  try {
    await Notification.create({
      owner: complaint.submittedBy,
      complaintId: complaint._id,
      type: "status_change",
      title: "Complaint Status Updated",
      message: `Your complaint "${complaint.title}" was changed from ${STATUS_LABELS[previousStatus] || previousStatus} to ${STATUS_LABELS[newStatus] || newStatus}${comment ? ` — ${comment}` : ""}.`,
    });
  } catch (_) {
    // notification failure should not break the main flow
  }
};

const createComplaint = async (data, userId) => {
  const complaint = await Complaint.create({ ...data, submittedBy: userId });

  await ComplaintUpdate.create({
    complaintId: complaint._id,
    actor: userId,
    actorRole: "student",
    newStatus: "submitted",
    comment: "Complaint submitted",
  });

  return complaint;
};

const getStudentComplaints = async (userId) => {
  return Complaint.find({ submittedBy: userId }).sort({ createdAt: -1 });
};

const getComplaintById = async (complaintId) => {
  const complaint = await Complaint.findById(complaintId)
    .populate("submittedBy", "name email")
    .populate("assignedTo", "name email");

  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const updates = await ComplaintUpdate.find({ complaintId })
    .populate("actor", "name email")
    .sort({ createdAt: 1 });

  return { complaint, updates };
};

const getAllComplaints = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (filters.department) query.assignedDepartment = filters.department;
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(query),
  ]);

  return {
    complaints,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const assignComplaint = async (complaintId, { assignedDepartment, assignedTo }, adminId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const previousStatus = complaint.status;
  complaint.assignedDepartment = assignedDepartment || complaint.assignedDepartment;
  complaint.assignedTo = assignedTo || complaint.assignedTo;
  complaint.status = "assigned";
  await complaint.save();

  await ComplaintUpdate.create({
    complaintId,
    actor: adminId,
    actorRole: "admin",
    previousStatus,
    newStatus: "assigned",
    comment: `Assigned to ${assignedDepartment || "department"}`,
  });

  await notifyStudent(complaint, "admin", previousStatus, "assigned", `Assigned to ${assignedDepartment || "department"}`);

  return complaint.populate("assignedTo", "name email");
};

const updateStatus = async (complaintId, { status, comment }, adminId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const previousStatus = complaint.status;
  complaint.status = status;
  await complaint.save();

  await ComplaintUpdate.create({
    complaintId,
    actor: adminId,
    actorRole: "admin",
    previousStatus,
    newStatus: status,
    comment,
  });

  await notifyStudent(complaint, "admin", previousStatus, status, comment);

  return complaint;
};

const updatePriority = async (complaintId, { priority }, adminId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const previousPriority = complaint.priority;
  complaint.priority = priority;
  await complaint.save();

  await ComplaintUpdate.create({
    complaintId,
    actor: adminId,
    actorRole: "admin",
    previousStatus: complaint.status,
    newStatus: complaint.status,
    comment: `Priority changed from ${previousPriority} to ${priority}`,
  });

  return complaint;
};

const resolveComplaint = async (complaintId, { resolutionDetails }, adminId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const previousStatus = complaint.status;
  complaint.status = "resolved";
  complaint.resolutionDetails = resolutionDetails;
  await complaint.save();

  await ComplaintUpdate.create({
    complaintId,
    actor: adminId,
    actorRole: "admin",
    previousStatus,
    newStatus: "resolved",
    comment: resolutionDetails || "Complaint resolved",
  });

  await notifyStudent(complaint, "admin", previousStatus, "resolved", resolutionDetails || "Complaint resolved");

  return complaint;
};

const submitFeedback = async (complaintId, { rating, comment }, userId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  if (complaint.submittedBy.toString() !== userId.toString()) {
    const error = new Error("Not authorized to submit feedback for this complaint");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  if (!["resolved", "closed"].includes(complaint.status)) {
    const error = new Error("Feedback can only be submitted for resolved or closed complaints");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  if (complaint.feedback && complaint.feedback.rating) {
    const error = new Error("Feedback has already been submitted for this complaint");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  complaint.feedback = {
    rating,
    comment,
    submittedAt: new Date(),
  };
  await complaint.save();

  return complaint;
};

module.exports = {
  createComplaint,
  getStudentComplaints,
  getComplaintById,
  getAllComplaints,
  assignComplaint,
  updateStatus,
  updatePriority,
  resolveComplaint,
  submitFeedback,
};
