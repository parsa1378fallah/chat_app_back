// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const { Server } = require("socket.io");
const config = require("config");
const router = require("./src/routes");
const socketHandler = require("./socket"); // کنترلر سوکت‌ها

const app = express();

// -------------------------
// CORS
// -------------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["access-token", "refresh-token"],
  })
);

// -------------------------
// Middleware
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// -------------------------
// SSL certificates
// -------------------------
const key = fs.readFileSync("./cert/localhost+2-key.pem");
const cert = fs.readFileSync("./cert/localhost+2.pem");

// -------------------------
// Port
// -------------------------
const PORT = config.get("server.port") || 5000;

// -------------------------
// Create HTTPS server
// -------------------------
const httpsServer = https.createServer({ key, cert }, app);

// -------------------------
// Initialize Socket.IO
// -------------------------
const io = new Server(httpsServer, {
  path: "/api/socket", // مسیر دلخواه برای اتصال سوکت
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach socket handlers
socketHandler(io);

// Set io in app for routes if needed
app.set("io", io);

// -------------------------
// API Routes
// -------------------------
app.use("/api", router);

// -------------------------
// Start server
// -------------------------
httpsServer.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
  console.log(`Socket.IO path: https://localhost:${PORT}/api/socket`);
});
