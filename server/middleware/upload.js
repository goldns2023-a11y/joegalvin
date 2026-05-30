const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {

    const isVideo =
      file.mimetype.startsWith("video");

    return {
      folder: "joegalvin",
      resource_type: isVideo ? "video" : "image",
      public_id: `${Date.now()}-${file.originalname}`
    };
  }
});

module.exports = multer({ storage });
