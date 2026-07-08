import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Facility from "../models/Facility.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

function signToken(user) {
  const facilityId = user.facility?._id ? user.facility._id : user.facility;
  return jwt.sign(
    { id: user._id, role: user.role, facility: facilityId, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = await User.findOne({ username: username.toLowerCase() }).populate("facility");
  if (!user) return res.status(401).json({ message: "Invalid username or password" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid username or password" });

  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      facility: user.facility,
    },
  });
});

// GET /api/auth/me - fetch current user profile (used to restore session)
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).populate("facility");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({
    id: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
    facility: user.facility,
  });
});

// POST /api/auth/register - admin only, creates a login for a PHC/CHC
router.post("/register", requireAuth, requireRole("admin"), async (req, res) => {
  const { username, password, name, facilityId } = req.body;
  if (!username || !password || !name || !facilityId) {
    return res.status(400).json({ message: "username, password, name, facilityId are required" });
  }

  const facility = await Facility.findById(facilityId);
  if (!facility) return res.status(404).json({ message: "Facility not found" });

  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Username already taken" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: username.toLowerCase(),
    passwordHash,
    name,
    role: "facility",
    facility: facility._id,
  });

  res.status(201).json({ id: user._id, username: user.username, facility: facility._id });
});

export default router;
