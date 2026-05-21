const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendRequest,
  acceptRequest,
  getConnectionStatus,
  getPendingRequests,
  removeConnection,
  getAcceptedConnections,
} = require("../controllers/connectionController");

// SEND REQUEST
router.post("/send/:userId", authMiddleware, sendRequest);

// ACCEPT REQUEST
router.put("/accept/:requestId", authMiddleware, acceptRequest);

// GET STATUS
router.get("/status/:userId", authMiddleware, getConnectionStatus);

// GET PENDING REQUESTS
router.get("/pending", authMiddleware, getPendingRequests);

// GET ACCEPTED CONNECTIONS
router.get("/accepted", authMiddleware, getAcceptedConnections);

// REMOVE CONNECTION
router.delete("/remove/:userId", authMiddleware, removeConnection);

module.exports = router;
