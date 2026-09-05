require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/complaint-management",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",

  // Cloudinary (optional — falls back to local disk if not set)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // Email Config
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT || "",
  SMTP_EMAIL: process.env.SMTP_USER || process.env.SMTP_EMAIL || "",
  SMTP_PASSWORD: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "",
  FROM_EMAIL: process.env.FROM_EMAIL || "",
  FROM_NAME: process.env.FROM_NAME || "",

  // AI Classification
  AI_PROVIDER: process.env.AI_PROVIDER || "none",
  AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "",
  AI_BASE_URL: process.env.AI_BASE_URL || "",
  AI_MODEL: process.env.AI_MODEL || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "",
};

