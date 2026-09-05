const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");

// Serve uploaded files only to authenticated users
router.get("/:filename", protect, (req, res) => {
  const filename = req.params.filename;
  // Prevent directory traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(__dirname, "../../uploads", safeFilename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

module.exports = router;
