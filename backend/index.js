const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const auth = require("./middleware/auth.js");
const authRouter = require("./routes/auth");
const authRouter2 = require("./routes/auth2");
const User = require("./models/user");
const Session = require("./models/session");
const upload = require("./storage");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { spawn } = require("child_process");
const multer = require("multer");
// const imageUpload = require("./storage");

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));
app.use(authRouter);
app.use(authRouter2);

// Database connection
const DB = "mongodb+srv://AikataPratyut:qazwsxedc%400987654321@mscdb.0tplylu.mongodb.net/kkpr";

mongoose.connect(DB)
  .then(() => {
    console.log("Database Connection Successful");
  })
  .catch((e) => {
    console.error("Database connection error:", e);
  });

// To check if the server is working or not
app.get("/works", (req, res) => {
  res.status(200).json({ message: "Server is Live ....." });
});

// Function to delete expired sessions
const deleteExpiredSessions = async () => {
  try {
    const sessions = await Session.find();
    for (const session of sessions) {
      try {
        jwt.verify(session.session, "passwordKey");
        // Session is still active
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          await Session.deleteOne({ _id: session._id });
          console.log(`Deleted expired session with ID: ${session._id}`);
        } else {
          console.error(`Failed to verify token for session with ID: ${session._id}. Error: ${err.message}`);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching sessions:", error.message);
  }
};

// Periodically clean up expired sessions every 5 minutes
setInterval(() => {
  console.log("Running cleanup of expired sessions...");
  deleteExpiredSessions();
}, 5 * 60 * 1000); // 5 minutes

// To logout securely
authRouter.post("/api/signout", auth, async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(400).json({ msg: "Incorrect token." });
  }

  try {
    const verified = jwt.verify(token, "passwordKey");
    if (!verified) {
      return res.status(400).json({ msg: "Incorrect token." });
    }

    // Add the token to the session blacklist
    const newSession = new Session({ session: token });
    await newSession.save();

    res.status(201).json({ message: 'Session invalidated successfully!', session: newSession });
  } catch (error) {
    console.error('Error during signout:', error);
    res.status(500).json({ error: 'Error during signout' });
  }
});

// To read the files data
app.get("/files", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const directoryPath = path.join(__dirname, "/json/", `${user.number}.json`);

    fs.readFile(directoryPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).json({ message: "Error reading user files" });
      }

      try {
        const jsonData = JSON.parse(data);
        const filteredData = jsonData.map(item => {
          const filtered = {};

          // Only include fields if they exist in the original data
          if ('filename' in item) filtered.filename = item.filename;
          if ('course_code' in item) filtered.course_code = item.course_code;
          if ('done' in item) filtered.done = item.done;
          if ('course_name' in item) filtered.course_name = item.course_name;
          if('last_modified' in item) filtered.last_modified = item.last_modified;

          return filtered;
        });

        res.status(200).json(filteredData);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        res.status(500).json({ message: "Error parsing JSON data" });
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// To read the sheet data
app.post("/numdata", auth, async (req, res) => {
  const num = req.body.num;

  if (num === undefined) {
    console.error("Error: 'num' is undefined.");
    return res.status(400).json({ message: "Error: 'num' is required in request body." });
  }

  try {
    const user = await User.findById(req.user);
    const directoryPath = path.join(__dirname, "/json/", `${user.number}.json`);

    fs.readFile(directoryPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).json({ message: "Error reading user data." });
      }

      try {
        const jsonData = JSON.parse(data);
        if (num >= jsonData.length || num < 0) {
          return res.status(400).json({ message: "Invalid 'num' parameter." });
        }
        res.status(200).json(jsonData[num]);
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
        res.status(500).json({ message: "Error parsing user data." });
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Function to execute Python script
async function dataext(number, jfn, fn) {
  try {
    const execPath = path.join(__dirname, "/data/", number, fn);
    const pythonProcess = spawn('python3', ['./extractor/ex.py', execPath, jfn]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python script output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error in Python script: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python script exited with code ${code}`);
    });
  } catch (error) {
    console.error('Error running Python script:', error);
  }
}


// Uploading the file, entering file data in json
app.post("/upload", auth, (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        console.error("File size exceeds the limit of 50MB.");
        return res.status(400).json({ message: "File size exceeds the limit of 50MB." });
      }
      console.error("File upload error:", err);
      return res.status(400).json({ message: err.message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Failed to upload file" });
    }

    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const entries = {
        filename: file.filename.toString(),
        done: 0,
      };

      const jsonFilename = path.join(__dirname, "/json/", `${user.number}.json`);

      let data = fs.readFileSync(jsonFilename, "utf8");
      let jsonData = JSON.parse(data);

      jsonData.push(entries);
      fs.writeFileSync(jsonFilename, JSON.stringify(jsonData));

      console.log("File updated and uploaded successfully - " + file.filename.toString());
      await dataext(user.number, jsonFilename, file.filename.toString());
      res.status(200).json({
        message: "File updated and uploaded successfully",
        filename: file.filename.toString(),
      });
    } catch (error) {
      console.error("Error during file upload:", error);
      res.status(500).json({ message: "File operation failed" });
    }
  });
});


// To delete
app.post("/delete", auth, async (req, res) => {
  const num = req.body.num;

  if (num === undefined) {
    console.error("Error: 'num' is undefined.");
    return res.status(400).json({ message: "Error: 'num' is required in request body." });
  }

  try {
    const user = await User.findById(req.user);
    const directoryPath = path.join(__dirname, "/json/", `${user.number}.json`);
    const filePath = path.join(__dirname, "/data/", user.number, "/");
    const downloadPath = path.join(__dirname, "/download/");

    let data = fs.readFileSync(directoryPath, "utf8");
    let jsonData = JSON.parse(data);

    if (num >= jsonData.length || num < 0) {
      return res.status(400).json({ message: "Invalid 'num' parameter." });
    }

    let fileToDelete = jsonData[num].filename;

    // Delete file from data directory
    const fullFilePath = path.join(filePath, fileToDelete);
    if (fs.existsSync(fullFilePath)) {
      fs.unlinkSync(fullFilePath);
      console.log(`Deleted file: ${fullFilePath}`);
    }

    // Delete file from download directory
    let downloadFilePath = path.join(downloadPath, fileToDelete);
    if (fs.existsSync(downloadFilePath)) {
      fs.unlinkSync(downloadFilePath);
      console.log(`Deleted file: ${downloadFilePath}`);
    }
    fileToDelete = jsonData[num].filename.split(".")[0] + "_del." + jsonData[num].filename.split(".")[1];
    // console.log("[DELETE] filetodelete is : ",fileToDelete);
    downloadFilePath = path.join(downloadPath, fileToDelete);
    if (fs.existsSync(downloadFilePath)) {
      fs.unlinkSync(downloadFilePath);
      console.log(`Deleted file: ${downloadFilePath}`);
    }

    if (jsonData[num]["copoMappingData"] && jsonData[num]["copoMappingData"]["imagePath"] && jsonData[num]["copoMappingData"]["imagePath"] != "") {
      console.log("reached here 1");
      if (fs.existsSync("." + jsonData[num]["copoMappingData"]["imagePath"])) {
        console.log("reached here");
        fs.unlinkSync("." + jsonData[num]["copoMappingData"]["imagePath"]);
        console.log(`Deleted file: ${"." + jsonData[num]["copoMappingData"]["imagePath"]}`);
      }
    }
    else {
      console.log("[DELETE] image does not exist");
    }

    // Remove entry from JSON data
    jsonData.splice(num, 1);
    fs.writeFileSync(directoryPath, JSON.stringify(jsonData));

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error during file deletion:", error);
    res.status(500).json({ message: "Error in /delete" });
  }
});

// To download
// To download
app.post("/download", auth, async (req, res) => {
  const num = req.body.num;

  if (num === undefined) {
    return res.status(400).json({ message: "Error: Missing 'num'" });
  }

  try {
    const user = await User.findById(req.user);
    const directoryPath = path.join(__dirname, "/json/", `${user.number}.json`);

    if (!fs.existsSync(directoryPath)) {
      return res.status(400).json({ message: "File not found" });
    }

    // Read user data
    const data = await fs.promises.readFile(directoryPath, "utf8");
    const jsonData = JSON.parse(data);
    
    if (num >= jsonData.length || num < 0) {
      return res.status(400).json({ message: "Invalid 'num' parameter." });
    }

    const fileData = jsonData[num];
    if (fileData["done"] !== 1) {
      return res.status(400).json({ message: "Extraction not yet finished" });
    }

    // Create a promise for the Python process
    const runPythonProcess = () => {
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', ['./extractor/j2d2p.py']);
        let pdfFileName = fileData['filename'];
        
        pythonProcess.stdin.write(JSON.stringify(fileData));
        pythonProcess.stdin.end();
        
        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python script error: ${data}`);
        });
        
        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`Python process exited with code ${code}`));
          }
          resolve(pdfFileName);
        });
      });
    };

    // Run the Python process and wait for it to complete
    const pdfFileName = await runPythonProcess();
    const pdfFilePath = path.join(__dirname, "download", pdfFileName);

    if (!fs.existsSync(pdfFilePath)) {
      return res.status(404).json({ message: "PDF file not found" });
    }

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
    
    // Stream the file with proper error handling
    const fileStream = fs.createReadStream(pdfFilePath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      // Only send error if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming file" });
      }
    });
    
    // Pipe the file to the response
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error in download route:", error);
    // Only send error if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error: " + error.message });
    }
  }
});

function validateNumeric(str) {
  if (!str) return 0;
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  } else {
    return 0;
  }
}

// To modify form parts
app.post("/form", auth, async (req, res) => {
  const num = req.body.num;

  if (num === undefined || num === null) {
    console.error("Error: 'num' is missing in the request");
    return res.status(400).json({ message: "Error in /form: 'num' is required" });
  }

  try {
    const user = await User.findById(req.user);
    const directoryPath = path.join(__dirname, "/json/", `${user.number}.json`);

    fs.readFile(directoryPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).json({ message: "Error reading user data" });
      }

      try {
        const jsonData = JSON.parse(data);

        if (num >= jsonData.length || num < 0) {
          return res.status(400).json({ message: "Invalid 'num' parameter." });
        }

        // Update existing fields

        //========================= PROGRAM ========================================================================
        try {
          let program = String(req.body.program);
          program = program.length > 2 ? program.substring(0, 2) : program;
          var program_return = 0;
          try {
            program_return = validateNumeric(program);
          }
          catch (error) {
            console.error("Error in validateNumeric function:", error.message || error);
            program_return = 0;
          }
          if (program_return < 0 || program_return > 10) {
            program_return = 0;
          }
          jsonData[num]["Program"] = program_return;
        }
        catch {
          jsonData[num]["Program"] = 0;
        }

        //================================= COURSE CODE ============================================================
        try {
          let raw_code = String(req.body.coursecode);
          let course_code = "";
          if (raw_code.length > 7) {
            course_code = raw_code.substring(7);
          }
          else if (raw_code.length < 7) {
            course_code = "";
          }
          else {
            course_code = raw_code;
          }

          if (course_code.length != 7) {
            jsonData[num]['course_code'] = "";
          }
          else {
            let firstThree = course_code.substring(0, 3);
            let lastFour = course_code.substring(3);
            // console.log("firstthree: " + firstThree);
            // console.log("lastfour: " + lastFour);

            let isFirstThreeAlpha = /^[a-zA-Z]+$/.test(firstThree);

            let isLastFourNumeric = /^[0-9]+$/.test(lastFour);

            if (isFirstThreeAlpha && isLastFourNumeric) {
              jsonData[num]['course_code'] = firstThree.toUpperCase() + lastFour;
            } else {
              jsonData[num]['course_code'] = "";
            }
          }
        }
        catch {
          jsonData[num]['course_code'] = "";
        }


        const courseTitle = req.body.coursetitle || "";
        if (courseTitle !== "" && courseTitle.length > 128) {
          courseTitle = courseTitle.substring(0, 128);
        }
        jsonData[num]['course_name'] = courseTitle;


        let moduleValue = req.body.module || "";
        if (moduleValue !== "" && moduleValue.length > 10) {
          moduleValue = moduleValue.substring(0, 10);
        }
        jsonData[num]['Module/Semester'] = moduleValue;


        let sessionValue = req.body.session || "";
        if (sessionValue !== "" && sessionValue.length > 12) {
          sessionValue = sessionValue.substring(0, 12);
        }
        jsonData[num]['Session'] = sessionValue;


        let courseDescription = req.body.EditableCourseDescriptionData || "";
        if (courseDescription !== "" && courseDescription.length > 4096) {
          courseDescription = courseDescription.substring(0, 4096);
        }
        jsonData[num]["course_description"] = courseDescription;


        jsonData[num]["Course Syllabus"] = req.body.courseSyllabus || "";
        jsonData[num]["Learning Resources"] = req.body.learningResources || "";
        jsonData[num]["copoMappingData"] = req.body.copoMappingData || "";
        jsonData[num]["internalAssessmentData"] = req.body.internalAssessmentData || "";
        jsonData[num]["actionsForWeakStudentsData"] = req.body.actionsForWeakStudentsData || "";
        jsonData[num]["coWeightages"] = req.body.coWeightages || "";
        jsonData[num]["coAttainmentCriteria"] = req.body.coAttainmentCriteria || "";
        jsonData[num]["targetAttainment"] = req.body.targetAttainment || "";
        jsonData[num]["studentData"] = req.body.studentData || "";
        jsonData[num]["last_modified"] = req.body.last_modified || "";


        let feedbackData = req.body.feedbackData || {};

        // Validate quantitativeFeedback
        let quantitative = parseFloat(feedbackData.quantitativeFeedback);
        if (isNaN(quantitative)) {
          quantitative = 0.00;
        }
        if (quantitative > 5.00) {
          quantitative = 5.00;
        } else if (quantitative < 0.00) {
          quantitative = 0.00;
        }
        // Optionally, format the number to two decimal places:
        feedbackData.quantitativeFeedback = quantitative.toFixed(2);

        // Validate qualitativeFeedback
        let qualitative = feedbackData.qualitativeFeedback || "";
        if (qualitative !== "" && qualitative.length > 4096) {
          qualitative = qualitative.substring(0, 4096);
        }
        feedbackData.qualitativeFeedback = qualitative;

        jsonData[num]["feedbackData"] = feedbackData;


        let facultyCourseReview = req.body.facultyCourseReview || "";
        if (facultyCourseReview !== "" && facultyCourseReview.length > 4096) {
          facultyCourseReview = facultyCourseReview.substring(0, 4096);
        }
        jsonData[num]["facultyCourseReview"] = facultyCourseReview;


        jsonData[num]["learnerCategories"] = req.body.learnerCategories || {};
        jsonData[num]["selectedAssessments"] = req.body.selectedAssessments || [];
        jsonData[num]["par_sem_slowLearner"] = req.body.par_sem_slowLearner || [];

        // Include weeklyTimetableData
        if (req.body.weeklyTimetableData) {
          jsonData[num]["weeklyTimetableData"] = req.body.weeklyTimetableData;
        }

        fs.writeFileSync(directoryPath, JSON.stringify(jsonData));
        res.status(200).json({ message: "Form data saved successfully" });
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
        res.status(500).json({ message: "Error parsing JSON data" });
      }
    });
  } catch (error) {
    console.error("Error in /form route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//to upload mergePDF
app.post('/upload-pdf', auth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        console.error('File size exceeds the limit of 50MB.');
        return res.status(400).json({ message: 'File size exceeds the limit of 50MB.' });
      }
      console.error('File upload error:', err);
      return res.status(400).json({ message: err.message });
    }

    const num = parseInt(req.headers.num); // Ensure 'num' is a number
    console.log("num is: " + num);

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Failed to upload file' });
    }

    try {
      console.log(file);
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const jsonFilename = path.join(__dirname, '/json/', `${user.number}.json`);
      let jsonData = [];
      if (fs.existsSync(jsonFilename)) {
        const data = fs.readFileSync(jsonFilename, 'utf8');
        jsonData = JSON.parse(data);
      }

      // Ensure that jsonData is an array and is large enough
      while (jsonData.length <= num) {
        jsonData.push({});
      }

      if (jsonData[num]["mergePDF"] && jsonData[num]["mergePDF"] != "") {
        if (fs.existsSync(`./data/${user.number}/` + jsonData[num]["mergePDF"])) {
          fs.unlinkSync(`./data/${user.number}/` + jsonData[num]["mergePDF"]);
          console.log(`Deleted file: ${`./data/${user.number}/` + jsonData[num]["mergePDF"]}`);
        }
      }

      jsonData[num]["mergePDF"] = file.filename.toString();
      fs.writeFileSync(jsonFilename, JSON.stringify(jsonData, null, 2));

      console.log('Your PDF has been uploaded: ' + file.filename.toString());

      res.status(200).json({
        message: 'PDF uploaded and JSON updated successfully',
        filename: file.filename.toString(),
      });
    } catch (error) {
      console.error('Error during file upload:', error);
      res.status(500).json({ message: 'File operation failed' });
    }
  });
});

// to delete merge pdf
app.post("/merge-delete", auth, async (req, res) => {

  const num = parseInt(req.headers.num);

  if (num === undefined) {
    console.error("Error: 'num' is undefined.");
    return res.status(400).json({ message: "Error: 'num' is required in request body." });
  }

  try {
    const user = await User.findById(req.user);
    const directoryPath = path.join(__dirname, "/json/", `${user.number}.json`);

    let data = fs.readFileSync(directoryPath, "utf8");
    let jsonData = JSON.parse(data);

    if (num >= jsonData.length || num < 0) {
      return res.status(400).json({ message: "Invalid 'num' parameter." });
    }

    if (jsonData[num]["mergePDF"] && jsonData[num]["mergePDF"] != "") {
      if (fs.existsSync(`./data/${user.number}/` + jsonData[num]["mergePDF"])) {
        fs.unlinkSync(`./data/${user.number}/` + jsonData[num]["mergePDF"]);
        console.log(`Deleted file: ${`./data/${user.number}/` + jsonData[num]["mergePDF"]}`);
      }
    }
    else {
      console.log("[MERGE-DELETE] file does not exist");
    }

    // Remove entry from JSON data
    jsonData[num]["mergePDF"] = "";
    fs.writeFileSync(directoryPath, JSON.stringify(jsonData));

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error during file deletion:", error);
    res.status(500).json({ message: "Error in /delete" });
  }
});

// To download
app.post("/download/xlsx", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);

    if (user.number >= 0 && user.number < 200) {
      const directoryPath = path.join(__dirname, "excel", "sample.xlsx");

      if (!fs.existsSync(directoryPath)) {
        return res.status(400).json({ message: "File not found" });
      }

      res.download(directoryPath, "sample.xlsx", (err) => {
        if (err) {
          console.error("Error occurred during file download:", err);
          return res.status(500).json({ message: "Error downloading the file" });
        }
      });
    } else {
      return res.status(400).json({ message: "Invalid user number" });
    }
  } catch (error) {
    console.error("Error in /download route:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// -------------------------------------------------------------------------
// New Route: Serve PDF for Viewing
// This route retrieves the PDF from disk and sends it to the client as a blob.
// Adjust the file path as needed (here we assume the PDFs are stored in ./data/1/)
// Add these new routes to your existing server.js file

// Directory for storing assignment PDFs
const assignmentPdfDir = path.join(__dirname, 'data', 'assignments');

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
app.post('/upload-assignment-pdf', auth, (req, res) => {
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
    
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Failed to upload file' });
    }

    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const jsonFilename = path.join(__dirname, '/json/', `${user.number}.json`);
      let jsonData = [];
      
      if (fs.existsSync(jsonFilename)) {
        const data = fs.readFileSync(jsonFilename, 'utf8');
        jsonData = JSON.parse(data);
      }

      // Ensure that jsonData is an array and is large enough
      while (jsonData.length <= num) {
        jsonData.push({});
      }

      // Delete old file if it exists
      if (jsonData[num]["assignmentPDF"] && jsonData[num]["assignmentPDF"] !== "") {
        const oldFilePath = path.join(assignmentPdfDir, jsonData[num]["assignmentPDF"]);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`Deleted old file: ${oldFilePath}`);
        }
      }

      // Store new file info
      jsonData[num]["assignmentPDF"] = file.filename;
      fs.writeFileSync(jsonFilename, JSON.stringify(jsonData, null, 2));

      console.log('Assignment PDF uploaded: ' + file.filename);

      res.status(200).json({
        message: 'Assignment PDF uploaded successfully',
        filename: file.filename,
      });
    } catch (error) {
      console.error('Error during assignment PDF upload:', error);
      res.status(500).json({ message: 'File operation failed' });
    }
  });
});
// Add this new route for PDF preview functionality
app.post("/preview", auth, async (req, res) => {
  const num = req.body.num;

  if (num === undefined) {
    console.error("Error: 'num' is missing in the request");
    return res.status(400).json({ message: "Error in /preview: Missing 'num'" });
  }

  try {
    const user = await User.findById(req.user);
    const directoryPath = path.join(__dirname, "/json/", `${user.number}.json`);

    if (!fs.existsSync(directoryPath)) {
      return res.status(400).json({ message: "File not found" });
    }

    fs.readFile(directoryPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).json({ message: "Error reading files" });
      }

      try {
        const jsonData = JSON.parse(data);
        if (num >= jsonData.length || num < 0) {
          return res.status(400).json({ message: "Invalid 'num' parameter." });
        }

        const fileData = jsonData[num];
        if (fileData["done"] !== 1) {
          return res.status(400).json({ message: "extraction not yet finished" });
        }
        const pythonProcess = spawn('python3', ['./extractor/j2d2p.py']);

        // Write JSON to the Python process's stdin and close it to signal we're done
        pythonProcess.stdin.write(JSON.stringify(fileData));
        pythonProcess.stdin.end();

        let pdfFileName = fileData['filename'];

        pythonProcess.stdout.on('data', (data) => {
          console.log(`Python script output (filename): ${pdfFileName}`);
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python script error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            return res.status(500).json({ message: "Error processing the file" });
          }

          const pdfFilePath = path.join(__dirname, "download", pdfFileName);

          if (!fs.existsSync(pdfFilePath)) {
            console.error("PDF file not found:", pdfFilePath);
            return res.status(500).json({ message: "PDF file not found" });
          }

          // Instead of triggering download, return the file path
          res.status(200).json({ 
            message: "PDF generated successfully",
            pdfUrl: `/view-pdf/${pdfFileName}`
          });
        });
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
        res.status(500).json({ message: "Error parsing JSON data" });
      }
    });
  } catch (error) {
    console.error("Error in /preview route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new route to serve the PDF for viewing
app.get("/view-pdf/:filename", auth, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "download", filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error("PDF file not found:", filePath);
    return res.status(404).json({ message: "PDF file not found" });
  }

  // Set appropriate headers for PDF viewing
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  
  // Stream the file to the client
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Delete endpoint for assignment PDFs
app.post('/delete-assignment-pdf', auth, async (req, res) => {
  const num = parseInt(req.headers.num);

  if (num === undefined) {
    return res.status(400).json({ message: "Error: 'num' is required in request headers." });
  }

  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const jsonFilename = path.join(__dirname, '/json/', `${user.number}.json`);

    if (!fs.existsSync(jsonFilename)) {
      return res.status(404).json({ message: "User data file not found" });
    }

    let jsonData = JSON.parse(fs.readFileSync(jsonFilename, 'utf8'));

    if (num >= jsonData.length || num < 0) {
      return res.status(400).json({ message: "Invalid 'num' parameter." });
    }

    // Delete the PDF file if it exists
    if (jsonData[num]["assignmentPDF"] && jsonData[num]["assignmentPDF"] !== "") {
      const filePath = path.join(assignmentPdfDir, jsonData[num]["assignmentPDF"]);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted assignment PDF: ${filePath}`);
      }
      
      // Update the JSON to remove the file reference
      jsonData[num]["assignmentPDF"] = "";
      fs.writeFileSync(jsonFilename, JSON.stringify(jsonData, null, 2));
      
      res.status(200).json({ message: "Assignment PDF deleted successfully" });
    } else {
      res.status(404).json({ message: "No assignment PDF found to delete" });
    }
  } catch (error) {
    console.error("Error during assignment PDF deletion:", error);
    res.status(500).json({ message: "Error deleting assignment PDF" });
  }
});

// Route to get the PDF file with authentication
app.get('/get-assignment-pdf/:filename', auth, (req, res) => {
  const { filename } = req.params;
  
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

// Alternative approach: Allow direct access to PDF files for authenticated users only
// This could be used instead of get-assignment-pdf if you prefer
app.get('/assignment-pdf/:filename', auth, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(assignmentPdfDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "PDF file not found" });
  }
  
  res.sendFile(filePath);
});


app.get("/pdf/:filename", auth, async (req, res) => {
  const { filename } = req.params;
  const user = await User.findById(req.user);
  const filePath = path.join(__dirname, "data", user.number, filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", filePath);
      return res.status(404).json({ error: 'File not found' });
    }
    res.sendFile(filePath);
  });
});



//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------ADMIN--------------------

app.get("/admin/login", (req, res) => {
  res.send("works");
});



app.listen(PORT, () => {
  console.log(`Server connected at port ${PORT}`);
});
