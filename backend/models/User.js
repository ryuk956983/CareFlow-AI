import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "facility"], required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
