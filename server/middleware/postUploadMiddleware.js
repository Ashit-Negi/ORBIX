const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video");

    return {
      folder: "orbix-posts",

      resource_type: isVideo ? "video" : "image",

      allowed_formats: isVideo
        ? ["mp4", "mov", "webm"]
        : ["jpg", "png", "jpeg", "webp"],
    };
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

module.exports = upload;
