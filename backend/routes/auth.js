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

// Sign Up
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

    // Try to find a gap in the numbering
    let number = userCount + 1; // default if no gap is found

    // Option 1: If you expect many users, you might want to fetch only the numbers.
    // Here we fetch all users sorted by the `number` field.
    const users = await User.find({}, { number: 1, _id: 0 }).sort({ number: 1 });
    console.log(users);
    console.log(users[0].number);

    // Loop from 1 to userCount to find the first missing number
    for (let i = 1; i <= userCount; i++) {
      console.log(i+" - "+users[i-1].number);
      console.log(typeof(i)+" - "+typeof(users[i-1].number));
      if (i != users[i-1].number) {
        number = i;
        break;
      }
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      number,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, "passwordKey", {
      expiresIn: "12h",
    });

    // Return the created user (excluding password)
    return res.status(201).json({ token, ...newUser._doc, password: undefined });
  } catch (e) {
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
