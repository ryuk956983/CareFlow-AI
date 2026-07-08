import mongoose from "mongoose";

const footfallLogSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    date: { type: Date, required: true, default: Date.now },
    patientCount: { type: Number, required: true, default: 0 },
    dailyCapacity: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

footfallLogSchema.index({ facility: 1, date: -1 });

export default mongoose.model("FootfallLog", footfallLogSchema);
