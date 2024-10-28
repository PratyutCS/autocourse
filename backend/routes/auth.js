const express = require("express");
const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
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

// get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

module.exports = authRouter;
