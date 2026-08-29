const jwt = require("jsonwebtoken");
const env = require("../config/env");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const User = require("../models/User");
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ code: "UNAUTHORIZED", message: "User not found" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authorized, token invalid" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Role not authorized" });
    }
    next();
  };
};

module.exports = { protect, authorize };
