const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const complaintController = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../services/uploadService");
const validate = require("../middleware/validate");

// Student: create complaint
router.post(
  "/",
  protect,
  authorize("student"),
  upload.array("attachments", 5),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  validate,
  complaintController.createComplaint
);

// Student: my complaints
router.get("/mine", protect, authorize("student"), complaintController.getMyComplaints);

// Admin: all complaints (with pagination/filter/search)
router.get("/", protect, authorize("admin"), complaintController.getAllComplaints);

// Shared: single complaint detail
router.get("/:id", protect, complaintController.getComplaint);

// Admin: assign
router.patch(
  "/:id/assign",
  protect,
  authorize("admin"),
  [
    body("assignedDepartment")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Department must be under 100 characters"),
    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid staff member ID"),
  ],
  validate,
  complaintController.assignComplaint
);

// Admin: update status
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  [
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["submitted", "under_review", "assigned", "in_progress", "resolved", "closed"])
      .withMessage("Invalid status"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment must be under 1000 characters"),
  ],
  validate,
  complaintController.updateStatus
);

// Admin: update priority
router.patch(
  "/:id/priority",
  protect,
  authorize("admin"),
  [
    body("priority")
      .notEmpty()
      .withMessage("Priority is required")
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Invalid priority"),
  ],
  validate,
  complaintController.updatePriority
);

// Admin: resolve
router.post(
  "/:id/resolve",
  protect,
  authorize("admin"),
  [
    body("resolutionDetails")
      .trim()
      .notEmpty()
      .withMessage("Resolution details are required")
      .isLength({ max: 2000 })
      .withMessage("Resolution details must be under 2000 characters"),
  ],
  validate,
  complaintController.resolveComplaint
);

// Student: submit feedback after resolution
router.post(
  "/:id/feedback",
  protect,
  authorize("student"),
  [
    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment must be under 1000 characters"),
  ],
  validate,
  complaintController.submitFeedback
);

module.exports = router;
