const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadAvatar = (req, res, next) => {
  req.uploadedUrl = "";
  next();
};

const uploadCover = (req, res, next) => {
  req.uploadedUrl = "";
  next();
};

module.exports = {
  upload,
  uploadAvatar,
  uploadCover,
};