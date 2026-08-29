const complaintService = require("../services/complaintService");

const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority } = req.body;
    const attachments = req.files
      ? req.files.map((f) => ({
          url: `/uploads/${f.filename}`,
          filename: f.filename,
          mimeType: f.mimetype,
        }))
      : [];

    const complaint = await complaintService.createComplaint(
      { title, description, category, location, priority, attachments },
      req.user.id
    );
    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await complaintService.getStudentComplaints(req.user.id);
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

const getComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaintById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, department, search, page, limit } = req.query;
    const result = await complaintService.getAllComplaints({
      status,
      category,
      priority,
      department,
      search,
      page,
      limit,
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
};
