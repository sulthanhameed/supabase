import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb, q } from "./src/db.js";
import { attachUser } from "./src/auth.js";
import publicRoutes from "./src/routes/public.js";
import adminRoutes from "./src/routes/admin.js";
import { PORT, API_PREFIX, FRONTEND_ORIGINS, corsOptions } from "./src/config.js";

const app = express();

// Frontend ↔ backend link: origins come from src/config.js (FRONTEND_URL env)
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(attachUser);

app.get("/", (_req, res) => res.json({ name: "Khang Chinese Restaurant & Dimsum API", health: `${API_PREFIX}/health`, allowedFrontends: FRONTEND_ORIGINS }));
app.get(`${API_PREFIX}/health`, async (_req, res) => {
  try { await q("SELECT 1"); res.json({ ok: true, service: "khang-backend", time: new Date().toISOString() }); } catch { res.status(500).json({ ok: false }); }
});

app.use(API_PREFIX, publicRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`🥢 Khang API listening on :${PORT}  (allowed frontends: ${FRONTEND_ORIGINS.join(", ")})`)))
  .catch((err) => { console.error("Failed to initialise database", err); process.exit(1); });
