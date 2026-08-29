const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const register = async ({ name, email, password, role, department }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already in use");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "student",
    department,
  });

  return generateTokenResponse(user);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }

  return generateTokenResponse(user);
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }
  return user;
};

const generateTokenResponse = (user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  };
};

module.exports = { register, login, getMe };
