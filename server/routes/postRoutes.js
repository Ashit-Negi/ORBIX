const express = require("express");

const router = express.Router();

const {
  createPost,
  getPosts,
  editPost,
  deletePost,
  getSinglePost,
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

// CREATE POST
router.post("/create", authMiddleware, createPost);

// GET ALL POSTS
router.get("/", getPosts);

// GET SINGLE POST
router.get("/:postId", getSinglePost);

// EDIT POST
router.put("/edit/:postId", authMiddleware, editPost);

// DELETE POST
router.delete("/delete/:postId", authMiddleware, deletePost);

module.exports = router;
