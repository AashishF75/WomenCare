const express = require("express");
const cors = require("cors");
const mongoose = require("./db");
/* Twilio removed */
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const path = require("path");

/* SOCKET.IO */
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

/* FRONTEND + STATIC FILES */
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/image", express.static(path.join(__dirname, "../image")));

/* ---------------- CLOUDINARY ---------------- */

cloudinary.config({
  cloud_name: "dmsovjhso",
  api_key: "713766388456354",
  api_secret: "YOUR_CLOUDINARY_API_SECRET"
});

/* ---------------- SECRET ---------------- */

const SECRET = "women-safety-secret";

/* ---------------- ADMIN ---------------- */

const adminUser = {
  username: "Aashish",
  password: bcrypt.hashSync("Nabbu@123", 10)
};

app.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== adminUser.username) {
    return res.json({ success: false });
  }

  const valid = await bcrypt.compare(password, adminUser.password);

  if (!valid) {
    return res.json({ success: false });
  }

  const token = jwt.sign(
    { user: "admin" },
    SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    success: true,
    token
  });
});

/* ---------------- VERIFY ADMIN ---------------- */

function verifyAdmin(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({
      message: "Invalid token"
    });
  }
}

/* ---------------- SOCKET ---------------- */

io.on("connection", () => {
  console.log("Admin connected");
});

/* ---------------- STORAGE ---------------- */

let sosAlerts = [];
let recordings = [];

/* ---------------- MULTER ---------------- */

const upload = multer({
  dest: "temp/"
});

/* ---------------- VIDEO UPLOAD ---------------- */

app.post("/upload-recording", upload.single("video"), async (req, res) => {
  try {
    console.log("Upload request received");

    if (!req.file) {
      return res.status(400).json({
        error: "No video file"
      });
    }

    const location = req.body.location || "Not provided";

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video"
    });

    const record = {
      videoUrl: result.secure_url,
      location,
      time: new Date()
    };

    recordings.push(record);

    res.json({
      message: "Recording uploaded",
      record
    });

  } catch (err) {
    console.log("Upload error:", err.message);

    res.status(500).json({
      error: "Upload failed"
    });
  }
});

/* ---------------- GET RECORDINGS ---------------- */

app.get("/all-recordings", verifyAdmin, (req, res) => {
  res.json(recordings);
});

/* ---------------- SOS ---------------- */

app.post("/sos", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Location missing"
      });
    }

    const link = `https://maps.google.com/?q=${latitude},${longitude}`;

    const alert = {
      id: sosAlerts.length + 1,
      latitude,
      longitude,
      locationLink: link,
      time: new Date()
    };

    sosAlerts.push(alert);

    io.emit("newSOS", alert);

    res.json({
      message: "SOS sent",
      alert
    });

  } catch (err) {
    console.log("SOS error:", err.message);

    res.status(500).json({
      error: "Failed"
    });
  }
});

/* ---------------- GET SOS ---------------- */

app.get("/sos-alerts", verifyAdmin, (req, res) => {
  res.json(sosAlerts);
});

/* ---------------- COMPLAINTS ---------------- */

const complaintSchema = new mongoose.Schema({
  name: String,
  email: String,
  description: String,
  status: {
    type: String,
    default: "Pending"
  }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

/* SUBMIT COMPLAINT */

app.post("/complaints", async (req, res) => {
  try {
    const complaint = new Complaint({
      name: req.body.name,
      email: req.body.email,
      description: req.body.description
    });

    await complaint.save();

    res.json(complaint);

  } catch (err) {
    console.log("Complaint save error:", err.message);

    res.status(500).json({
      status: "Save failed"
    });
  }
});

/* TRACK COMPLAINT */

app.get("/complaints/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.json({
        status: "Complaint not found"
      });
    }

    res.json(complaint);

  } catch (err) {
    console.log("Track complaint error:", err.message);

    res.json({
      status: "Invalid ID"
    });
  }
});

/* GET ALL COMPLAINTS */

app.get("/allcomplaints", verifyAdmin, async (req, res) => {
  const complaints = await Complaint.find();
  res.json(complaints);
});

/* SOLVE COMPLAINT */

app.put("/solve/:id", verifyAdmin, async (req, res) => {
  await Complaint.findByIdAndUpdate(
    req.params.id,
    {
      status: "Solved"
    }
  );

  res.json({
    message: "Solved"
  });
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});