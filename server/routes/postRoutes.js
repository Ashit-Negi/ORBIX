const express = require("express");

const router = express.Router();

const {
  createPost,
  getPosts,
  editPost,
  deletePost,
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

// CREATE POST
router.post("/create", authMiddleware, createPost);

// GET ALL POSTS
router.get("/", getPosts);

// EDIT POST
router.put("/edit/:postId", authMiddleware, editPost);

// DELETE POST
router.delete("/delete/:postId", authMiddleware, deletePost);

module.exports = router;
