require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { initializeDatabase } = require("./config/database");
const auditRoutes = require("./routes/audit");
const roomStayRoutes = require("./routes/roomStay");
const itemRoutes = require("./routes/item");
const roomRoutes = require("./routes/room");

const app = express();

// Initialize database
initializeDatabase().then((success) => {
  if (!success) process.exit(1);
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
  });
});

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/room-stays", roomStayRoutes);
app.use("/api/audits", auditRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
