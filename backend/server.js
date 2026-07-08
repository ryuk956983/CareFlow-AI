import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import facilityRoutes from "./routes/facilityRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import footfallRoutes from "./routes/footfallRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "Aarogya Setu Kendra API" }));

app.use("/api/auth", authRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/facilities/:facilityId/doctors", doctorRoutes);
app.use("/api/facilities/:facilityId/footfall", footfallRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Generic error handler (keeps API responses consistent)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
