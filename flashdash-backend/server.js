const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware - CORS configuration for production
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://flashfinancialsolutions.com",
    "https://www.flashfinancialsolutions.com",
    "https://flashdash.vip"
  ],
  credentials: true
}));

app.use(express.json());

console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("Running in Lambda:", !process.env.IS_OFFLINE);

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const forthcrmRoutes = require("./routes/forthcrm");

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forthcrm", forthcrmRoutes);

// CORS-safe error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  let origin = req.headers.origin;
  if (!origin || !allowedOrigins.includes(origin)) {
    origin = allowedOrigins[allowedOrigins.length - 1] || "*";
  }

  // Fix: Ensure only a single origin is sent in the header
  if (typeof origin === "string" && origin.includes(",")) {
    origin = origin.split(",")[0].trim();
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports.handler = serverless(app);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, "127.0.0.1", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
