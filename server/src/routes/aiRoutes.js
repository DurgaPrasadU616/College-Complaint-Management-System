const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const aiController = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.get("/status", protect, aiController.getAIStatus);

router.post(
  "/classify",
  protect,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 100 })
      .withMessage("Title must be under 100 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 2000 })
      .withMessage("Description must be under 2000 characters"),
  ],
  validate,
  aiController.classifyComplaint
);

module.exports = router;
