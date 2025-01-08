const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

let merchandises = []; // In-memory merchandise data (for Sell items)

// Get all merchandises
app.get("/api/merchandises", (req, res) => {
  res.status(200).json(merchandises);
});

// Add a new merchandise
app.post("/api/merchandises", (req, res) => {
  const newMerchandise = { id: uuidv4(), ...req.body };
  merchandises.push(newMerchandise);
  res.status(201).json(newMerchandise);
});

// Reset merchandises
app.delete("/api/merchandises", (req, res) => {
  merchandises = []; // Clear all data
  res.status(200).json({ message: "All data has been reset." });
});

// Server start
app.listen(PORT, () => {
  console.log(`Server is running on http://my_ip:${PORT}`);
});
