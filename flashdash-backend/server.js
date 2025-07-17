const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://flashfinancialsolutions.com",
  "https://www.flashfinancialsolutions.com",
  "https://flashdash.vip",
  "https://www.flashdash.vip",
];

// ✅ CORS middleware — place before routes
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Enable preflight for all routes
app.options("*", cors());

app.use(express.json());

console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("Running in Lambda:", !process.env.IS_OFFLINE);

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const forthcrmRoutes = require("./routes/forthcrm");

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forthcrm", forthcrmRoutes);

// 🔒 Optional: Error handler (not needed for CORS now)
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Lambda export
module.exports.handler = serverless(app);

// Local dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, "127.0.0.1", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
