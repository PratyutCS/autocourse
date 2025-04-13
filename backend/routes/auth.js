const express = require("express");
const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth.js");
// const multer = require('multer');

function check(q){
  for(let i=0;i<q.length;i++){
      let ue=q.charCodeAt(i);
      if(!((ue>=64 && ue<=90) || (ue>=97 && ue<=122) || (ue>=48 && ue<=57) || (ue != 64) || (ue != 46))){
          return true;
      }
  }
  return false;
}

// Sign In
authRouter.post("/api/signin", async (req, res) => {
  try {
    let { email, password } = req.body;
    if(email == undefined || password == undefined){
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    
    email = (email.toString()).substr(0, 40).trim();
    password = (password.toString()).substr(0, 16).trim();
    
    if(check(email) || check(password)){
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    const token = jwt.sign({
      id: user._id
    },
      "passwordKey", {
      expiresIn: '12h'
    });
    return res.json({ token, ...user._doc });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

//tokenvalidator
authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    
    if (!user) return res.json(false);
    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const fs = require('fs');
const path = require('path');

authRouter.post("/api/signup", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    // Sanitize and trim inputs
    name = name.toString().trim();
    email = email.toString().trim();
    password = password.toString().trim();

    if (name.length > 50 || email.length > 40 || password.length > 16) {
      return res.status(400).json({ msg: "Invalid input length." });
    }

    if (check(name) || check(email) || check(password)) {
      return res.status(400).json({ msg: "Invalid input characters." });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Calculate the user number
    const userCount = await User.countDocuments();
    let number = userCount + 1;

    const users = await User.find({}, { number: 1, _id: 0 }).sort({ number: 1 });
    for (let i = 1; i <= userCount; i++) {
      if (i !== users[i - 1].number) {
        number = i;
        break;
      }
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      u_pass: password,
      number,
    });

    // Save user to database
    await newUser.save();

    // ==== Create folder and JSON file ====
    const baseDir = path.join(__dirname, '../'); // You can customize this path
    const userDir = path.join(baseDir, "data" , `${number}`);
    const jsonFilePath = path.join(userDir, "" , `${number}.json`);

    // Ensure base directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
    }

    // Create folder for user
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
    }

    // Create a JSON file with some basic user data (you can customize this)
    const userJsonData = {
      number,
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(jsonFilePath, JSON.stringify(userJsonData, null, 2), 'utf-8');
    // ====================================

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, "passwordKey", {
      expiresIn: "12h",
    });

    return res.status(201).json({ token, ...newUser._doc, password: undefined });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});



// get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  const retData = {};
  retData.name = user.name;
  retData.email = user.email;
  retData.number = user.number;

  res.json({...retData});
});

module.exports = authRouter;
