const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 100 })
      .withMessage("Name must be under 100 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["student", "admin"])
      .withMessage("Role must be student or admin"),
    body("department")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Department must be under 100 characters"),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email"),
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.get("/me", protect, authController.getMe);

module.exports = router;
