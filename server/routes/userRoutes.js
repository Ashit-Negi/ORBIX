const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  searchUsers,
  getSuggestedUsers,
  getAllUsers,
} = require("../controllers/userController");

router.get("/search", authMiddleware, searchUsers);

router.get("/suggested", authMiddleware, getSuggestedUsers);

router.get("/all", authMiddleware, getAllUsers);

module.exports = router;
