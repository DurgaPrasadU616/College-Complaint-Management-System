const complaintService = require("../services/complaintService");

const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority } = req.body;

    let ai = null;
    if (req.body.ai) {
      try {
        ai = typeof req.body.ai === "string" ? JSON.parse(req.body.ai) : req.body.ai;
      } catch (_) {
        // ignore malformed AI data
      }
    }

    const attachments = req.files
      ? req.files.map((f) => ({
          url: f.path || `/uploads/${f.filename}`,
          filename: f.originalname || f.filename,
          mimeType: f.mimetype,
        }))
      : [];

    const complaint = await complaintService.createComplaint(
      { title, description, category, location, priority, attachments, ai },
      req.user.id
    );
    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const { search, page, limit, status, category, priority, sort } = req.query;
    const result = await complaintService.getStudentComplaints(req.user.id, {
      search,
      page,
      limit,
      status,
      category,
      priority,
      sort,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaintById(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, department, search, page, limit, assignedTo, unassigned, sort } =
      req.query;
    const result = await complaintService.getAllComplaints({
      status,
      category,
      priority,
      department,
      search,
      page,
      limit,
      assignedTo,
      unassigned,
      sort,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const assignComplaint = async (req, res, next) => {
  try {
    const { assignedDepartment, assignedTo } = req.body;
    const complaint = await complaintService.assignComplaint(
      req.params.id,
      { assignedDepartment, assignedTo },
      req.user.id
    );
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const complaint = await complaintService.updateStatus(
      req.params.id,
      { status, comment },
      req.user.id
    );
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

const updatePriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    const complaint = await complaintService.updatePriority(
      req.params.id,
      { priority },
      req.user.id
    );
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

const resolveComplaint = async (req, res, next) => {
  try {
    const { resolutionDetails } = req.body;
    const complaint = await complaintService.resolveComplaint(
      req.params.id,
      { resolutionDetails },
      req.user.id
    );
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await complaintService.submitFeedback(
      req.params.id,
      { rating, comment },
      req.user.id
    );
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const complaint = await complaintService.addComment(req.params.id, comment, req.user);
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaint,
  getAllComplaints,
  assignComplaint,
  updateStatus,
  updatePriority,
  resolveComplaint,
  submitFeedback,
  addComment,
};
