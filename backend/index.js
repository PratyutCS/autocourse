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
// const imageUpload = require("./storage");

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
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
app.post("/download", auth, async (req, res) => {
  const num = req.body.num;

  if (num === undefined) {
    console.error("Error: 'num' is missing in the request");
    return res.status(400).json({ message: "Error in /download: Missing 'num'" });
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

          res.download(pdfFilePath, pdfFileName, (err) => {
            if (err) {
              console.error("Error occurred during file download:", err);
              return res.status(500).json({ message: "Error downloading the file" });
            }
          });
        });
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
        res.status(500).json({ message: "Error parsing JSON data" });
      }
    });
  } catch (error) {
    console.error("Error in /download route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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
        jsonData[num]['course_code'] = req.body.coursecode || "";
        jsonData[num]['course_name'] = req.body.coursetitle || "";
        jsonData[num]['Module/Semester'] = req.body.module || "";
        jsonData[num]['Session'] = req.body.session || "";
        jsonData[num]["course_description"] = req.body.EditableCourseDescriptionData || "";
        jsonData[num]["Course Syllabus"] = req.body.courseSyllabus || "";
        jsonData[num]["Learning Resources"] = req.body.learningResources || "";
        jsonData[num]["copoMappingData"] = req.body.copoMappingData || "";
        jsonData[num]["internalAssessmentData"] = req.body.internalAssessmentData || "";
        jsonData[num]["actionsForWeakStudentsData"] = req.body.actionsForWeakStudentsData || "";
        jsonData[num]["Program"] = req.body.program || "";
        jsonData[num]["coWeightages"] = req.body.coWeightages || "";
        jsonData[num]["coAttainmentCriteria"] = req.body.coAttainmentCriteria || "";
        jsonData[num]["targetAttainment"] = req.body.targetAttainment || "";
        jsonData[num]["studentData"] = req.body.studentData || "";
        jsonData[num]["feedbackData"] = req.body.feedbackData || "";
        jsonData[num]["facultyCourseReview"] = req.body.facultyCourseReview || "";

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
        if (fs.existsSync("./data/1/" + jsonData[num]["mergePDF"])) {
          fs.unlinkSync("./data/1/" + jsonData[num]["mergePDF"]);
          console.log(`Deleted file: ${"./data/1/" + jsonData[num]["mergePDF"]}`);
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
      if (fs.existsSync("./data/1/" + jsonData[num]["mergePDF"])) {
        fs.unlinkSync("./data/1/" + jsonData[num]["mergePDF"]);
        console.log(`Deleted file: ${"./data/1/" + jsonData[num]["mergePDF"]}`);
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


//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------ADMIN--------------------

app.get("/admin/login", (req,res)=>{
  res.send("works");
});



app.listen(PORT, () => {
  console.log(`Server connected at port ${PORT}`);
});
