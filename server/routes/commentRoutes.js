const express = require("express");

const router = express.Router();

const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

// CREATE COMMENT
router.post("/create", authMiddleware, createComment);

// GET COMMENTS BY POST
router.get("/:postId", getCommentsByPost);

// UPDATE COMMENT
router.put("/update/:commentId", authMiddleware, updateComment);

// DELETE COMMENT
router.delete("/delete/:commentId", authMiddleware, deleteComment);

module.exports = router;
