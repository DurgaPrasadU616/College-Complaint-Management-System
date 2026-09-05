const Complaint = require("../models/Complaint");
const ComplaintUpdate = require("../models/ComplaintUpdate");
const notificationService = require("../services/notificationService");

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
};

const LIST_PROJECTION =
  "title category location priority status submittedBy assignedTo assignedDepartment createdAt updatedAt";

const sanitizeSearch = (search) => {
  if (!search || typeof search !== "string") return null;
  const trimmed = search.trim().slice(0, 100);
  if (trimmed.length === 0) return null;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped;
};

const parseSort = (sort) => {
  if (!sort || typeof sort !== "string") return SORT_OPTIONS.newest;
  return SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
};

const createComplaint = async (data, userId) => {
  const { ai, ...complaintData } = data;
  const complaint = await Complaint.create({
    ...complaintData,
    submittedBy: userId,
    ...(ai && {
      ai: {
        category: ai.category || null,
        priority: ai.priority || null,
        summary: ai.summary || null,
        tags: ai.tags || [],
        model: ai.model || null,
        analyzedAt: new Date(),
      },
    }),
  });

  await ComplaintUpdate.create({
    complaintId: complaint._id,
    actor: userId,
    actorRole: "student",
    newStatus: "submitted",
    comment: "Complaint submitted",
  });

  const user = await require("../models/User").findById(userId).select("name");
  await notificationService.notifyComplaintSubmitted(complaint, user?.name || "A student");

  return complaint;
};

const getStudentComplaints = async (userId, filters = {}) => {
  const query = { submittedBy: userId };

  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;

  const sanitized = sanitizeSearch(filters.search);
  if (sanitized) {
    query.$or = [
      { title: { $regex: sanitized, $options: "i" } },
      { description: { $regex: sanitized, $options: "i" } },
    ];
  }

  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit) || 10));
  const skip = (page - 1) * limit;
  const sort = parseSort(filters.sort);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .select(LIST_PROJECTION)
      .populate("assignedTo", "name email")
      .sort(sort)
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
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

const getComplaintById = async (complaintId, user) => {
  const complaint = await Complaint.findById(complaintId)
    .populate("submittedBy", "name email")
    .populate("assignedTo", "name email");

  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  if (user.role === "student" && complaint.submittedBy._id.toString() !== user.id) {
    const error = new Error("Not authorized to view this complaint");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
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
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.unassigned === "true") query.assignedTo = null;

  const sanitized = sanitizeSearch(filters.search);
  if (sanitized) {
    query.$or = [
      { title: { $regex: sanitized, $options: "i" } },
      { description: { $regex: sanitized, $options: "i" } },
    ];
  }

  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit) || 10));
  const skip = (page - 1) * limit;
  const sort = parseSort(filters.sort);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .select(LIST_PROJECTION)
      .populate("submittedBy", "name email")
      .populate("assignedTo", "name email")
      .sort(sort)
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
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
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
  const previousStaff = complaint.assignedTo;

  let newStatus = complaint.status;
  if (["submitted", "under_review"].includes(complaint.status)) {
    newStatus = "assigned";
  }

  complaint.assignedDepartment = assignedDepartment || complaint.assignedDepartment;
  complaint.assignedTo = assignedTo || complaint.assignedTo;
  complaint.status = newStatus;
  await complaint.save();

  await ComplaintUpdate.create({
    complaintId,
    actor: adminId,
    actorRole: "admin",
    previousStatus,
    newStatus,
    comment: `Assigned to ${assignedDepartment || "department"}`,
  });

  const isReassignment = previousStaff && previousStaff.toString() !== (assignedTo || "").toString();

  if (isReassignment) {
    await notificationService.notifyComplaintReassigned(
      complaint,
      previousStaff,
      assignedTo,
      assignedDepartment
    );
  } else {
    await notificationService.notifyComplaintAssigned(complaint, assignedTo, assignedDepartment);
  }

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

  if (["in_progress", "resolved"].includes(status)) {
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== adminId.toString()) {
      const error = new Error("Only the assigned staff member can transition this complaint");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }
  }

  const validTransitions = {
    submitted: ["under_review", "closed"],
    under_review: ["assigned", "closed"],
    assigned: ["in_progress", "closed"],
    in_progress: ["resolved", "closed"],
    resolved: ["closed"],
    closed: [],
  };

  if (status !== complaint.status && status !== "assigned") {
    if (!validTransitions[complaint.status]?.includes(status)) {
      const error = new Error(`Invalid status transition from ${complaint.status} to ${status}`);
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }
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

  await notificationService.notifyStatusChanged(complaint, previousStatus, status, comment);

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

  if (!complaint.assignedTo || complaint.assignedTo.toString() !== adminId.toString()) {
    const error = new Error("Only the assigned staff member can resolve this complaint");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
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

  await notificationService.notifyStatusChanged(
    complaint,
    previousStatus,
    "resolved",
    resolutionDetails || "Complaint resolved"
  );

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

  await notificationService.notifyFeedbackReceived(complaint, complaint.assignedTo, rating);

  return complaint;
};

const addComment = async (complaintId, comment, user) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  if (user.role === "student" && complaint.submittedBy.toString() !== user.id) {
    const error = new Error("Not authorized to comment on this complaint");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  if (user.role === "admin") {
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== user.id.toString()) {
      const error = new Error("You can only comment on complaints assigned to you");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }
  }

  await ComplaintUpdate.create({
    complaintId,
    actor: user.id,
    actorRole: user.role,
    previousStatus: complaint.status,
    newStatus: complaint.status,
    comment,
  });

  await notificationService.notifyNewComment(complaint, user, comment);

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
  addComment,
};
