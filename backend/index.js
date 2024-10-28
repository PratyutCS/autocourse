const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const authRouter = require("./routes/auth");
const User = require("./models/user");
const Session = require("./models/session");
const upload = require("./storage");
let path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { spawn } = require('child_process');

async function dataext(number, jfn, fn){
  try{
  const exec = path.join(
    __dirname,
    "/data/" + number + "/" + fn
  );
    let data = fs.readFileSync(jfn, "utf8");
    data = JSON.parse(data);
    const pythonProcess = spawn('python3', ['./extractor/ex.py', exec, jfn]);
    let dat;
    pythonProcess.stdout.on('data', (data) => {
        dat = `${data}`;
        console.log(`Python script output: ${data}`);
    });
  
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error in Python script: ${data}`);
      });
      pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
  }
  catch{
    console.error('Error running Python script:', error);
  }
}

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001', // Your frontend URL
  credentials: true
}))
app.use(authRouter);
// app.use(express.static(__dirname + "/public/assets"));

const DB =
  "mongodb+srv://AikataPratyut:aikata%40123@mscdb.0tplylu.mongodb.net/kkpr";

mongoose
  .connect(DB)
  .then(() => {
    console.log("Data-Base Connection Successful");
  })
  .catch((e) => {
    console.log(e);
  });

app.get("/works", (req, res) => {
  return res.status(200).json({
    message: "server works",
  });
});

// Function to delete expired sessions
const deleteExpiredSessions = async () => {
  try {
    const sessions = await Session.find();
    for (const session of sessions) {
      try {
        jwt.verify(session.session, "passwordKey");
        // console.log("session still active");
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          await Session.deleteOne({ _id: session._id });
          console.log(`Deleted expired session with ID: ${session._id}`);
        } else {
          console.log(`Failed to verify token for session with ID: ${session._id}. Error: ${err.message}`);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching sessions:", error.message);
  }
};

setInterval(() => {
  console.log("Running cleanup of expired sessions...");
  deleteExpiredSessions();
}, 5*60*1000); // 5 minutes

//To logout securely
authRouter.post("/api/signout",auth, async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) 
    return res.status(400).json({ msg: "Incorrect token." });

  const verified = jwt.verify(token, "passwordKey");

  if (!verified) 
    return res.status(400).json({ msg: "Incorrect token." });

  try {
    // Create a new User document
    const newSession = new Session({
      session:token,
    });

    // Save the user to the database
    await newSession.save();

    res.status(201).json({ message: 'Session removed successfully!', session: newSession });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Error adding session' });
  }
});

//To read the files data
app.get("/files", auth, async (req, res) => {
  const user = await User.findById(req.user);
  
  const directoryPath = path.join(
    __dirname,
    "/json/" + user.number + ".json"
  );
  
  fs.readFile(directoryPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        message: "Error in read /files",
      });
    } else {
      try {
        data = JSON.parse(data);
        // let ren = [];
        // for (let i = 0; i < data.length; i++) {
        //   ren.push(data[i]);
        // }
        res.status(200).json(data);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        res.status(500).json({ message: "Error parsing JSON data" });
      }
    }
  });
});

//To read the sheetdata
app.post("/numdata", auth, async (req, res) => {
  const user = await User.findById(req.user);
  const num = req.body.num;
  if(num === undefined){
    console.log("error in reading num : "+num);
    return res.status(400).json({
      message: "Error in /numdata",
    });
  }
  console.log(num);
  // console.log(user.number);
  const directoryPath = path.join(
    __dirname,
    "/json/" + user.number + ".json"
  );
  fs.readFile(directoryPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        message: "Error in read /files",
      });
    } else {
      data = JSON.parse(data);
      if(num >= data.length){
        return res.status(400).json({
          message: "Error in /numdata",
        });
      }
      res.status(200).json(data[num]);
    }
  });
});

//uploading the file , entering file data in json
app.post("/upload", auth, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        console.log("File size exceeds the limit of 50MB.");
        return res.status(400).json({
          message: "File size exceeds the limit of 50MB.",
        });
      }
      return res.status(400).json({
        message: err.message,
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "Failed to upload file",
      });
    }

    User.findById(req.user).then((user) => {
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      var entries = {
        filename: file.filename.toString(),
        done:0
      };

      const jsonfilename = path.join(
        __dirname,
        "/json/" + user.number + ".json"
      );

      try {
        let data = fs.readFileSync(jsonfilename, "utf8");
        let jsonData = JSON.parse(data);

        jsonData.push(entries);

        fs.writeFileSync(jsonfilename, JSON.stringify(jsonData));

        console.log("File updated and uploaded successfully - "+file.filename.toString());
        dataext(user.number,jsonfilename,file.filename.toString());

        res.status(200).json({
          message: "File updated and uploaded successfully",
          filename: file.filename.toString(),
        });
      } catch (err) {
        console.log(err);
        return res.status(400).json({
          message: "File operation failed",
        });
      }
    }).catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Error finding user",
      });
    });
  });
});

//To delete
app.post("/delete", auth, async (req, res) => {
  const user = await User.findById(req.user);
  const num = req.body.num;
  if(num === undefined){
    console.log("error in reading num : "+num);
    return res.status(400).json({
      message: "Error in /delete",
    });
  }
  // console.log("number is "+num);
  // console.log(user.number);
  const directoryPath = path.join(
    __dirname,
    "/json/" + user.number + ".json"
  );
  const filePath = path.join(
    __dirname,
    "/data/" + user.number + "/"
  );
  const dfilePath = path.join(
    __dirname,
    "/download/"
  );
  console.log(directoryPath);
  fs.readFile(directoryPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        message: "Error in /delete",
      });
    } else {
      data = JSON.parse(data);
      // console.log(data[num]);
      if(num >= data.length){
        return res.status(400).json({
          message: "Error in /delete",
        });
      }
      try{
        // console.log(filePath + data[num].filename);
        if (fs.existsSync(filePath + data[num].filename)) {
          console.log(`${filePath + data[num].filename} exists deleting.....`);
          fs.unlinkSync(filePath + data[num].filename);
        }
        if (fs.existsSync(dfilePath + data[num].filename)) {
          console.log(`${dfilePath + data[num].filename} exists deleting.....`);
          fs.unlinkSync(dfilePath + data[num].filename);
        }
        if(num != (data.length-1)){
          data[num] = data[data.length - 1];
        }
        data.pop();
        fs.writeFileSync(directoryPath, JSON.stringify(data));
      }
      catch (err){
        console.log(err);
        return res.status(400).json({
          message: "Error in /delete",
        });
      }
      return res.status(200).json({
        message: "kardiya ro mat",
      });
    }
  });
});

//To download
app.post("/download", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const num = req.body.num;
    
    if (num == undefined) {
      console.error("Error: 'num' is missing in the request");
      return res.status(400).json({ message: "Error in /download: Missing 'num'" });
    }
    
    const directoryPath = path.join(__dirname, `/json/${user.number}.json`);
    
    if (!fs.existsSync(directoryPath)) {
      return res.status(400).json({ message: "File not found" });
    }
    
    fs.readFile(directoryPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).json({ message: "Error in reading files" });
      }
      data = JSON.parse(data)[num];
      const pythonProcess = spawn('python3', ['./extractor/j2d2p.py', JSON.stringify(data)]);

      let pdfFileName = data['filename'];
      pythonProcess.stdout.on('data', (data) => {
        // pdfFileName = data.toString().trim();
        console.log(`Python script output (filename): ${pdfFileName}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          return res.status(500).json({ message: "Error in processing the file" });
        }

        const pdfFilePath = path.join(__dirname, "download", `${pdfFileName}`);

        if (!fs.existsSync(pdfFilePath)) {
          console.error("PDF file not found:", pdfFilePath);
          return res.status(500).json({ message: "PDF file not found" });
        }

        res.download(pdfFilePath, `${pdfFileName}`, (err) => {
          if (err) {
            console.error("Error occurred during file download:", err);
            return res.status(500).json({ message: "Error in downloading the file" });
          }
        });
      });
    });
  } catch (error) {
    console.error("Error in /download route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//To modify form parts
app.post("/form", auth, async (req, res) => {
  const user = await User.findById(req.user);
  const num = req.body.num;
  if(num === undefined || num === null){
    console.log("error in reading num : "+num);
    return res.status(400).json({
      message: "Error in /form",
    });
  }
  console.log("lmfoa is : "+num);
  const directoryPath = path.join(
    __dirname,
    "/json/" + user.number + ".json"
  );
  
  fs.readFile(directoryPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        message: "Error in read /form",
      });
    } else {
      try{
        data = JSON.parse(data);
        // data[num].reflections = req.body.reflections;
        data[num]["Course_details"]['course_code'] = req.body.coursecode;
        data[num]["Course_details"]['course_name'] = req.body.coursetitle;
        data[num]["Course_details"]['Module/Semester'] = req.body.module;
        data[num]["Course_details"]['Session'] = req.body.session;
        data[num]["course_description"] = req.body.EditableCourseDescriptionData['description'];
        fs.writeFileSync(directoryPath, JSON.stringify(data));
      }
      catch (error) {
        console.log(error);
        return res.status(400).json({
          message: "Error in /form",
        });
      }
      res.status(200).json("done scene hai apna /form");
    }
  });
});

app.listen(PORT, () => {
  console.log(`connected at port ${PORT}`);
});