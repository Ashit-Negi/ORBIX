const express = require("express");

const router = express.Router();

const { votePost } = require("../controllers/voteController");

const authMiddleware = require("../middleware/authMiddleware");

// VOTE POST
router.post("/", authMiddleware, votePost);

module.exports = router;
