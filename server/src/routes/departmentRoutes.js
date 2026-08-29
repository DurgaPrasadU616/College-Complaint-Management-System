const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Department = require("../models/Department");
const { protect, authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.get("/", protect, authorize("admin"), async (req, res, next) => {
  try {
    const departments = await Department.find().populate("staffMembers", "name email");
    res.json(departments);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Department name is required")
      .isLength({ max: 100 })
      .withMessage("Name must be under 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be under 500 characters"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, description, staffMembers } = req.body;

      const existing = await Department.findOne({ name });
      if (existing) {
        return res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Department with this name already exists",
        });
      }

      const department = await Department.create({ name, description, staffMembers });
      res.status(201).json(department);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
