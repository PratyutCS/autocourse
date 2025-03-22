const multer = require('multer');
let path = require('path');
const mongoose = require("mongoose");
const User = require("./models/user");

const getDestination = async (req, file, cb) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return cb(new Error('User not found'), null);
    }
    const folderName = path.join(__dirname, '/data/', user.number, '/');
    cb(null, folderName);
  } catch (error) {
    cb(error, null);
  }
};

const storage = multer.diskStorage({
  destination: getDestination,
  filename: (req, file, cb) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const originalName = file.originalname;
    const extIndex = originalName.lastIndexOf('.');
    const name = extIndex !== -1 ? originalName.substring(0, extIndex).substring(0, 32) : originalName.substring(0, 32);
    const ext = extIndex !== -1 ? originalName.substring(extIndex) : '';
    cb(null, `${timestamp}_${name}${ext}`);
  },
});
const imageUpload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Invalid file type. Only images (JPEG, PNG) are allowed."), false); // Reject the file
    }
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folderName = path.join(__dirname, "/images/"); // Directory for image uploads
      cb(null, folderName);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`); // Save file with a timestamp
    },
  }),
});

module.exports = imageUpload;

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
    }
  },
  storage: storage,
});

module.exports = upload;