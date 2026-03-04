import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import settingsRoutes from "./routes/settings.js";
import generateRoutes from "./routes/generate.js";
import flyersRoutes from "./routes/flyers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/flyers", flyersRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Serve built frontend in production
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`FlyrAI server running on http://localhost:${PORT}`);
  });
}

start();
