const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// Directory for storing assignment PDFs
const assignmentPdfDir = path.join(__dirname, '..', 'data', 'assignments');

// Create directory if it doesn't exist
if (!fs.existsSync(assignmentPdfDir)) {
  fs.mkdirSync(assignmentPdfDir, { recursive: true });
}

// Configure storage for assignment PDFs
const assignmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, assignmentPdfDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const assignmentUpload = multer({
  storage: assignmentStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload endpoint for assignment PDFs
router.post('/upload-assignment-pdf', auth, (req, res) => {
  assignmentUpload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        console.error('File size exceeds the limit of 50MB.');
        return res.status(400).json({ message: 'File size exceeds the limit of 50MB.' });
      }
      console.error('File upload error:', err);
      return res.status(400).json({ message: err.message });
    }

    const num = parseInt(req.headers.num);
    const assignmentType = req.headers['assignment-type']; // Get assignment type from header
    
    if (!assignmentType) {
      return res.status(400).json({ message: 'Assignment type is required' });
    }
    
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Failed to upload file' });
    }

    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const jsonFilename = path.join(__dirname, '..', '/json/', `${user.number}.json`);
      let jsonData = [];
      
      if (fs.existsSync(jsonFilename)) {
        const data = fs.readFileSync(jsonFilename, 'utf8');
        jsonData = JSON.parse(data);
      }

      // Ensure that jsonData is an array and is large enough
      while (jsonData.length <= num) {
        jsonData.push({});
      }

      // Initialize assignmentData object if it doesn't exist
      if (!jsonData[num].assignmentData) {
        jsonData[num].assignmentData = {};
      }
      
      // Delete old file if it exists
      if (jsonData[num].assignmentData[assignmentType]) {
        const oldFilePath = path.join(assignmentPdfDir, jsonData[num].assignmentData[assignmentType]);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`Deleted old file: ${oldFilePath}`);
        }
      }

      // Store new file info in the assignmentData structure
      jsonData[num].assignmentData[assignmentType] = file.filename;
      fs.writeFileSync(jsonFilename, JSON.stringify(jsonData, null, 2));

      console.log(`Assignment PDF uploaded for ${assignmentType}: ${file.filename}`);

      res.status(200).json({
        message: `${assignmentType} PDF uploaded successfully`,
        filename: file.filename,
      });
    } catch (error) {
      console.error('Error during assignment PDF upload:', error);
      res.status(500).json({ message: 'File operation failed' });
    }
  });
});

// Delete endpoint for assignment PDFs
router.post('/delete-assignment-pdf', auth, async (req, res) => {
  const num = parseInt(req.headers.num);
  const assignmentType = req.body.assignmentType;

  if (!assignmentType) {
    return res.status(400).json({ message: "Assignment type is required" });
  }

  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const jsonFilename = path.join(__dirname, '..', '/json/', `${user.number}.json`);

    if (!fs.existsSync(jsonFilename)) {
      return res.status(404).json({ message: "User data file not found" });
    }

    let jsonData = JSON.parse(fs.readFileSync(jsonFilename, 'utf8'));

    if (num >= jsonData.length || num < 0) {
      return res.status(400).json({ message: "Invalid 'num' parameter." });
    }

    // Delete the PDF file if it exists
    if (jsonData[num].assignmentData && 
        jsonData[num].assignmentData[assignmentType]) {
      const filePath = path.join(assignmentPdfDir, jsonData[num].assignmentData[assignmentType]);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted assignment PDF: ${filePath}`);
      }
      
      // Update the JSON to remove the file reference
      delete jsonData[num].assignmentData[assignmentType];
      fs.writeFileSync(jsonFilename, JSON.stringify(jsonData, null, 2));
      
      res.status(200).json({ message: `${assignmentType} PDF deleted successfully` });
    } else {
      res.status(404).json({ message: `No ${assignmentType} PDF found to delete` });
    }
  } catch (error) {
    console.error("Error during assignment PDF deletion:", error);
    res.status(500).json({ message: "Error deleting assignment PDF" });
  }
});

// Route to serve PDF files with authentication
router.get('/get-assignment-pdf/:assignmentType/:filename', auth, (req, res) => {
  const { assignmentType, filename } = req.params;
  
  if (!filename) {
    return res.status(400).json({ message: "Filename is required" });
  }
  
  try {
    const filePath = path.join(assignmentPdfDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "PDF file not found" });
    }
    
    // Set appropriate headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Send the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving PDF file:", error);
    res.status(500).json({ message: "Error retrieving PDF file" });
  }
});

module.exports = router;