const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { toggleCommentLike } = require("../controllers/commentLikeController");

// TOGGLE COMMENT LIKE
router.post("/toggle", authMiddleware, toggleCommentLike);

module.exports = router;
