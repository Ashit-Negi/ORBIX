const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendRequest,
  acceptRequest,
  getConnectionStatus,
  getPendingRequests,
} = require("../controllers/connectionController");

// SEND REQUEST
router.post("/send/:userId", authMiddleware, sendRequest);

// ACCEPT REQUEST
router.put("/accept/:requestId", authMiddleware, acceptRequest);

// GET STATUS
router.get("/status/:userId", authMiddleware, getConnectionStatus);

// GET PENDING REQUESTS
router.get("/pending", authMiddleware, getPendingRequests);

module.exports = router;
