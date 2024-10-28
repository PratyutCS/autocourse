const multer = require('multer');
let path = require('path');
const mongoose = require("mongoose");
const User = require("./models/user");

const getDestination = async (req, file, cb) => {
  const user = await User.findById(req.user);
  if (!user) {
    return cb(new Error('User not found'), null);
  }
  const folderName = path.join(__dirname, '/data/'+ user.number+'/');
  cb(null, `${folderName}`);
};

const storage = multer.diskStorage({
  destination: getDestination,
  filename: (req, file, cb) => {
    cb(null, Math.floor(new Date().getTime() / 1000)+file.originalname);
  },
});

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, //5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only pdf files are allowed.'), false);
    }
  },
  storage: storage,
});

module.exports = upload;