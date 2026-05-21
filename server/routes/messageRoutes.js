const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createConversation,
  sendMessage,
  getUserConversations,
  getConversationMessages,
} = require("../controllers/messageController");

// CREATE CONVERSATION
router.post("/conversation", authMiddleware, createConversation);

// SEND MESSAGE
router.post("/send", authMiddleware, sendMessage);

// GET ALL USER CONVERSATIONS
router.get("/conversations", authMiddleware, getUserConversations);

// GET SINGLE CONVERSATION MESSAGES
router.get("/:conversationId", authMiddleware, getConversationMessages);

module.exports = router;
