const express = require("express");
const rateLimit = require("express-rate-limit");
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
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
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


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: { message: "Too many login attempts. Please try again later." }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registrations per hour
  message: { message: "Too many registration attempts. Please try again later." }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: "Too many reset attempts. Please try again later." }
});

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email"),
  ],
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password/:token",
  [
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
