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

const upload = require("../middleware/postUploadMiddleware");

// CREATE POST
router.post("/create", authMiddleware, upload.single("media"), createPost);

// GET ALL POSTS
router.get("/", getPosts);

// GET SINGLE POST
router.get("/:postId", getSinglePost);

// EDIT POST
router.put("/edit/:postId", authMiddleware, upload.single("media"), editPost);

// DELETE POST
router.delete("/delete/:postId", authMiddleware, deletePost);

module.exports = router;
