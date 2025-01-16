const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv"); 
dotenv.config();

// Create uploads directory if not exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const URL = process.env.DB; // Use the DB URL from .env
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// MongoDB Schema
const FormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String, required: true },
  image: { type: String, required: true },
});

const Form = mongoose.model("Form", FormSchema);

// API Routes

// Submit Form
app.post("/api/submitForm", upload.single("image"), async (req, res) => {
  const { name, details } = req.body;
  const image = req.file.filename;

  const newForm = new Form({ name, details, image });
  try {
    await newForm.save();
    res.status(200).send("Form submitted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error submitting form");
  }
});

// Get All Forms
app.get("/api/getForms", async (req, res) => {
  try {
    const forms = await Form.find();
    res.status(200).json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching forms");
  }
});

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
