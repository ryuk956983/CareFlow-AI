import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    name: { type: String, required: true },
    doctorId: { type: String, required: true },
    department: { type: String, default: "General" },
    shift: { type: String, enum: ["Morning", "Evening", "Night"], default: "Morning" },
    present: { type: Boolean, default: false },
    lastCheckIn: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("DoctorProfile", doctorProfileSchema);
