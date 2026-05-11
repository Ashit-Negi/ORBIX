const express = require("express");

const router = express.Router();

const { createPost, getPosts } = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

// CREATE POST
router.post("/create", authMiddleware, createPost);

// GET ALL POSTS
router.get("/", getPosts);

module.exports = router;
