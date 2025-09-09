// Entry point 

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { pool } from "./db.js";

// Routers
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import questionRoutes from "./routes/questions.js";

const app = express();

// Middleware 
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json()); // parse JSON

// check
app.get("/", (_req, res) => {
  res.json({ ok: true, name: "Fairway Forum API" });
});

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/questions", questionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

// Start Server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Fairway Forum API listening on http://localhost:${PORT}`);
});

// Graceful shutdown
async function shutdown(signal) {
  try {
    console.log(`\n${signal} received. Closing server...`);
    server.close(async () => {
      console.log("HTTP server closed. Closing DB pool...");
      try {
        await pool.end();
        console.log("DB pool closed. Bye!");
        process.exit(0);
      } catch (e) {
        console.error("Error closing DB pool:", e);
        process.exit(1);
      }
    });
  } catch (e) {
    console.error("Shutdown error:", e);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

