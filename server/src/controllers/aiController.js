const aiClassificationService = require("../services/aiClassificationService");
const env = require("../config/env");

const classifyComplaint = async (req, res, next) => {
  try {
    if (env.AI_PROVIDER === "none" || !env.AI_PROVIDER) {
      return res.status(503).json({
        code: "AI_UNAVAILABLE",
        message: "AI classification is not enabled. Contact your administrator.",
      });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Title and description are required for classification.",
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Title must be under 100 characters.",
      });
    }

    if (description.length > 2000) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Description must be under 2000 characters.",
      });
    }

    const result = await aiClassificationService.classifyComplaint(title, description);

    res.json({
      category: result.category,
      priority: result.priority,
      summary: result.summary,
      tags: result.tags,
      model: env.AI_MODEL || env.AI_PROVIDER,
    });
  } catch (error) {
    if (error.message.includes("AI API key not configured")) {
      return res.status(503).json({
        code: "AI_UNAVAILABLE",
        message: "AI classification is not configured. Contact your administrator.",
      });
    }
    if (error.message.includes("AI classification is not enabled")) {
      return res.status(503).json({
        code: "AI_UNAVAILABLE",
        message: "AI classification is not enabled.",
      });
    }
    if (error.message.includes("AI API error")) {
      return res.status(502).json({
        code: "AI_PROVIDER_ERROR",
        message: "AI service is temporarily unavailable. Try again later.",
      });
    }
    if (error.message.includes("Invalid JSON") || error.message.includes("Empty AI response")) {
      return res.status(502).json({
        code: "AI_PROVIDER_ERROR",
        message: "AI returned an invalid response. Try again.",
      });
    }
    if (error.name === "TimeoutError" || error.message.includes("timeout")) {
      return res.status(504).json({
        code: "AI_TIMEOUT",
        message: "AI analysis timed out. Try again.",
      });
    }
    next(error);
  }
};

const getAIStatus = async (req, res) => {
  const provider = env.AI_PROVIDER || "none";
  res.json({
    enabled: provider !== "none",
    provider: provider === "none" ? null : provider,
    model: env.AI_MODEL || null,
  });
};

module.exports = { classifyComplaint, getAIStatus };
