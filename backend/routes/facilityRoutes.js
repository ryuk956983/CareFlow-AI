import express from "express";
import Facility from "../models/Facility.js";
import { requireAuth, requireRole, scopeToOwnFacility } from "../middleware/auth.js";

const router = express.Router();

// GET /api/facilities - admin: all facilities in district. facility user: just their own.
router.get("/", requireAuth, async (req, res) => {
  if (req.user.role === "admin") {
    const facilities = await Facility.find().sort({ name: 1 });
    return res.json(facilities);
  }
  const facility = await Facility.findById(req.user.facility);
  res.json(facility ? [facility] : []);
});

// GET /api/facilities/:facilityId
router.get("/:facilityId", requireAuth, scopeToOwnFacility, async (req, res) => {
  const facility = await Facility.findById(req.params.facilityId);
  if (!facility) return res.status(404).json({ message: "Facility not found" });
  res.json(facility);
});

// POST /api/facilities - admin only, add a new PHC/CHC
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const facility = await Facility.create(req.body);
  res.status(201).json(facility);
});

// PUT /api/facilities/:facilityId - update profile basics (beds, doctors count, name...)
router.put("/:facilityId", requireAuth, scopeToOwnFacility, async (req, res) => {
  const { name, type, district, block, beds, doctors } = req.body;
  const facility = await Facility.findByIdAndUpdate(
    req.params.facilityId,
    { $set: { name, type, district, block, beds, doctors } },
    { new: true, runValidators: true }
  );
  if (!facility) return res.status(404).json({ message: "Facility not found" });
  res.json(facility);
});

// DELETE /api/facilities/:facilityId - admin only
router.delete("/:facilityId", requireAuth, requireRole("admin"), async (req, res) => {
  await Facility.findByIdAndDelete(req.params.facilityId);
  res.json({ message: "Facility deleted" });
});

// ---- Medicines sub-resource ----

// POST /api/facilities/:facilityId/medicines
router.post("/:facilityId/medicines", requireAuth, scopeToOwnFacility, async (req, res) => {
  const facility = await Facility.findById(req.params.facilityId);
  if (!facility) return res.status(404).json({ message: "Facility not found" });
  facility.medicines.push(req.body);
  await facility.save();
  res.status(201).json(facility);
});

// PUT /api/facilities/:facilityId/medicines/:medId
router.put("/:facilityId/medicines/:medId", requireAuth, scopeToOwnFacility, async (req, res) => {
  const facility = await Facility.findById(req.params.facilityId);
  if (!facility) return res.status(404).json({ message: "Facility not found" });
  const med = facility.medicines.id(req.params.medId);
  if (!med) return res.status(404).json({ message: "Medicine not found" });
  Object.assign(med, req.body);
  await facility.save();
  res.json(facility);
});

// DELETE /api/facilities/:facilityId/medicines/:medId
router.delete("/:facilityId/medicines/:medId", requireAuth, scopeToOwnFacility, async (req, res) => {
  const facility = await Facility.findById(req.params.facilityId);
  if (!facility) return res.status(404).json({ message: "Facility not found" });
  facility.medicines.id(req.params.medId).deleteOne();
  await facility.save();
  res.json(facility);
});

export default router;
