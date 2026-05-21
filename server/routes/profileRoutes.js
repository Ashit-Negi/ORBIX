const express = require("express");

const router = express.Router();

const {
  getUserProfile,
  updateProfile,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
// UPDATE PROFILE
router.put(
  "/update/profile",
  authMiddleware,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.log("MULTER ERROR:", err);
        return res.status(500).json({ message: err.message });
      }
      console.log("FILE:", req.file);
      console.log("BODY:", req.body);
      next();
    });
  },
  updateProfile,
);
// GET PROFILE
router.get("/:username", getUserProfile);

module.exports = router;
