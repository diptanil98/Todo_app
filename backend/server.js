const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");

const app = express();

// For this assignment we keep CORS simple and allow the Vite dev server
// (and other localhost ports) to reach the API without credentials.
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Server error",
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  if (!MONGO_URI) {
    // Fail fast with a clear message.
    throw new Error("Missing MONGO_URI in environment");
  }
  if (MONGO_URI === "memory") {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri());
    // eslint-disable-next-line no-console
    console.log("Connected to in-memory MongoDB");
  } else {
    await mongoose.connect(MONGO_URI);
    // eslint-disable-next-line no-console
    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
  }
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

