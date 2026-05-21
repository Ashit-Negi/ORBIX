const express = require("express");

const router = express.Router();

const {
  createCommunity,
  getCommunities,
  getSingleCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityPosts,
  searchCommunities,
} = require("../controllers/communityController");

const authMiddleware = require("../middleware/authMiddleware");

// CREATE COMMUNITY
router.post("/create", authMiddleware, createCommunity);

// SEARCH COMMUNITIES
router.get("/search", authMiddleware, searchCommunities);

// GET ALL COMMUNITIES
router.get("/", getCommunities);

// GET SINGLE COMMUNITY
router.get("/:slug", getSingleCommunity);

// GET COMMUNITY POSTS
router.get("/:slug/posts", getCommunityPosts);

// JOIN COMMUNITY
router.post("/join/:communityId", authMiddleware, joinCommunity);

// LEAVE COMMUNITY
router.post("/leave/:communityId", authMiddleware, leaveCommunity);

module.exports = router;
