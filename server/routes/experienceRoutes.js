const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addExperience,
  getUserExperiences,
  updateExperience,
  deleteExperience,
} = require("../controllers/experienceController");

// ADD EXPERIENCE
router.post("/add", authMiddleware, addExperience);

// GET USER EXPERIENCES
router.get("/:userId", getUserExperiences);

// UPDATE EXPERIENCE
router.put("/update/:experienceId", authMiddleware, updateExperience);

// DELETE EXPERIENCE
router.delete("/delete/:experienceId", authMiddleware, deleteExperience);

module.exports = router;
