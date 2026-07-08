import express from "express";
import FootfallLog from "../models/FootfallLog.js";
import { requireAuth, scopeToOwnFacility } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

// GET /api/facilities/:facilityId/footfall?limit=30
router.get("/", requireAuth, scopeToOwnFacility, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 180);
  const logs = await FootfallLog.find({ facility: req.params.facilityId })
    .sort({ date: -1 })
    .limit(limit);
  res.json(logs.reverse());
});

// POST /api/facilities/:facilityId/footfall
router.post("/", requireAuth, scopeToOwnFacility, async (req, res) => {
  const { date, patientCount, dailyCapacity } = req.body;
  const log = await FootfallLog.create({
    facility: req.params.facilityId,
    date: date ? new Date(date) : new Date(),
    patientCount,
    dailyCapacity,
  });
  res.status(201).json(log);
});

export default router;
