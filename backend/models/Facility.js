import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, default: "units" },
    stockOnHand: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, required: true, default: 0 },
    avgDailyConsumption: { type: Number, required: true, default: 0 },
  },
  { _id: true }
);

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["PHC", "CHC"], required: true },
    district: { type: String, required: true, default: "Kanpur Dehat" },
    block: { type: String, default: "" },

    beds: {
      total: { type: Number, default: 0 },
      occupied: { type: Number, default: 0 },
    },
    doctors: {
      assigned: { type: Number, default: 0 },
      presentToday: { type: Number, default: 0 },
    },

    medicines: [medicineSchema],
  },
  { timestamps: true }
);

// Virtual: quick stock status helper reused by the API layer
facilitySchema.methods.medicineStatus = function (med) {
  if (med.stockOnHand <= med.reorderLevel * 0.5) return "Critical";
  if (med.stockOnHand <= med.reorderLevel) return "Low";
  return "Adequate";
};

export default mongoose.model("Facility", facilitySchema);
