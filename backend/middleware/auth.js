import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, facility, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden for this role" });
    }
    next();
  };
}

// Facility-role users may only touch their own facility's data.
// Admins may touch any facility. Expects req.params.facilityId.
export function scopeToOwnFacility(req, res, next) {
  if (req.user.role === "admin") return next();
  if (req.user.facility?.toString() !== req.params.facilityId) {
    return res.status(403).json({ message: "You can only access your own facility's data" });
  }
  next();
}
