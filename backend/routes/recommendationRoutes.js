import express from "express";
import Facility from "../models/Facility.js";
import { requireAuth } from "../middleware/auth.js";
import { generateRecommendations } from "../services/recommendationEngine.js";

const router = express.Router();

// GET /api/recommendations
// Admin: district-wide redistribution recommendations across all facilities.
// Facility user: recommendations relevant to their own facility only.
router.get("/", requireAuth, async (req, res) => {
  const facilities = await Facility.find();
  const result = generateRecommendations(facilities);

  if (req.user.role === "admin") return res.json(result);

  const myId = req.user.facility?.toString();
  res.json({
    ...result,
    transferRecommendations: result.transferRecommendations.filter(
      (t) => t.fromFacilityId === myId || t.toFacilityId === myId
    ),
    facilityFlags: result.facilityFlags.filter((f) => f.facilityId === myId),
  });
});

export default router;
