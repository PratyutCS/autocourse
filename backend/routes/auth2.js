const express = require("express");
const bcryptjs = require("bcryptjs");
const Admin = require("../models/admin");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth.js");

function check(q) {
  for (let i = 0; i < q.length; i++) {
    let ue = q.charCodeAt(i);
    if (!((ue >= 64 && ue <= 90) || (ue >= 97 && ue <= 122) || (ue >= 48 && ue <= 57) || (ue !== 64) || (ue !== 46))) {
      return true;
    }
  }
  return false;
}

// Sign In
authRouter.post("/admin/api/signin", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (email === undefined || password === undefined) {
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    
    email = email.toString().substr(0, 40).trim();
    password = password.toString().substr(0, 16).trim();
    
    if (check(email) || check(password)) {
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    const isMatch = await bcryptjs.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect credentials." });
    }
    const token = jwt.sign(
      { id: admin._id },
      "passwordKey",
      { expiresIn: '12h' }
    );
    return res.json({ token, ...admin._doc });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Token validator
authRouter.post("/admin/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const admin = await Admin.findById(verified.id);
    if (!admin) return res.json(false);
    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sign Up
authRouter.post("/admin/api/signup", async (req, res) => {
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
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ msg: "Admin with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Calculate `number` as the size of the collection + 1
    const adminCount = await Admin.countDocuments();
    const number = adminCount + 1;

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      number,
    });

    // Save admin to database
    await newAdmin.save();

    // Generate JWT token
    const token = jwt.sign({ id: newAdmin._id }, "passwordKey", {
      expiresIn: "12h",
    });

    // Return the created admin (excluding password)
    return res.status(201).json({ token, ...newAdmin._doc, password: undefined });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get admin data
authRouter.get("/admin", auth, async (req, res) => {
  const admin = await Admin.findById(req.user);
  const retData = {
    name: admin.name,
    email: admin.email,
    number: admin.number,
  };

  res.json({ ...retData });
});

module.exports = authRouter;