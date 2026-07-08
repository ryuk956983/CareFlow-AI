import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import Facility from "../models/Facility.js";
import User from "../models/User.js";
import DoctorProfile from "../models/DoctorProfile.js";
import FootfallLog from "../models/FootfallLog.js";
import mongoose from "mongoose";

async function run() {
  await connectDB();
  console.log("Clearing existing demo data...");
  await Promise.all([Facility.deleteMany({}), User.deleteMany({}), DoctorProfile.deleteMany({}), FootfallLog.deleteMany({})]);

  const facilitiesData = [
    {
      name: "Ghatampur CHC",
      type: "CHC",
      district: "Kanpur Dehat",
      block: "Ghatampur",
      beds: { total: 30, occupied: 26 },
      doctors: { assigned: 6, presentToday: 5 },
      medicines: [
        { name: "ORS packets", unit: "packets", stockOnHand: 40, reorderLevel: 150, avgDailyConsumption: 18 },
        { name: "Paracetamol 500mg", unit: "tablets", stockOnHand: 800, reorderLevel: 300, avgDailyConsumption: 40 },
        { name: "IFA tablets", unit: "tablets", stockOnHand: 200, reorderLevel: 250, avgDailyConsumption: 30 },
        { name: "Amoxicillin syrup", unit: "bottles", stockOnHand: 15, reorderLevel: 40, avgDailyConsumption: 5 },
        { name: "Oxytocin injection", unit: "ampoules", stockOnHand: 60, reorderLevel: 30, avgDailyConsumption: 4 },
      ],
    },
    {
      name: "Rura PHC",
      type: "PHC",
      district: "Kanpur Dehat",
      block: "Rura",
      beds: { total: 10, occupied: 4 },
      doctors: { assigned: 2, presentToday: 2 },
      medicines: [
        { name: "ORS packets", unit: "packets", stockOnHand: 400, reorderLevel: 100, avgDailyConsumption: 10 },
        { name: "Paracetamol 500mg", unit: "tablets", stockOnHand: 150, reorderLevel: 200, avgDailyConsumption: 25 },
        { name: "Amoxicillin syrup", unit: "bottles", stockOnHand: 60, reorderLevel: 20, avgDailyConsumption: 3 },
      ],
    },
    {
      name: "Bhognipur PHC",
      type: "PHC",
      district: "Kanpur Dehat",
      block: "Bhognipur",
      beds: { total: 8, occupied: 7 },
      doctors: { assigned: 2, presentToday: 1 },
      medicines: [
        { name: "ORS packets", unit: "packets", stockOnHand: 90, reorderLevel: 80, avgDailyConsumption: 9 },
        { name: "IFA tablets", unit: "tablets", stockOnHand: 500, reorderLevel: 150, avgDailyConsumption: 12 },
        { name: "Oxytocin injection", unit: "ampoules", stockOnHand: 5, reorderLevel: 20, avgDailyConsumption: 3 },
      ],
    },
  ];

  const facilities = await Facility.insertMany(facilitiesData);
  console.log(`Created ${facilities.length} facilities`);

  // Doctors for Ghatampur CHC
  const ghatampur = facilities[0];
  await DoctorProfile.insertMany([
    { facility: ghatampur._id, name: "Dr. A. Sharma", doctorId: "DOC-001", department: "General Medicine", shift: "Morning", present: true, lastCheckIn: new Date() },
    { facility: ghatampur._id, name: "Dr. R. Gupta", doctorId: "DOC-002", department: "Paediatrics", shift: "Morning", present: true, lastCheckIn: new Date() },
    { facility: ghatampur._id, name: "Dr. S. Khan", doctorId: "DOC-003", department: "Gynaecology", shift: "Evening", present: false },
    { facility: ghatampur._id, name: "Dr. P. Verma", doctorId: "DOC-004", department: "General Medicine", shift: "Evening", present: true, lastCheckIn: new Date() },
    { facility: ghatampur._id, name: "Dr. N. Yadav", doctorId: "DOC-005", department: "Orthopaedics", shift: "Night", present: true, lastCheckIn: new Date() },
    { facility: ghatampur._id, name: "Dr. M. Singh", doctorId: "DOC-006", department: "General Medicine", shift: "Night", present: false },
  ]);

  // A couple weeks of footfall history per facility
  const today = new Date();
  const footfallDocs = [];
  for (const facility of facilities) {
    const baseline = facility.type === "CHC" ? 60 : 25;
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      footfallDocs.push({
        facility: facility._id,
        date,
        patientCount: Math.max(5, Math.round(baseline + (Math.random() * 20 - 10))),
        dailyCapacity: baseline + 20,
      });
    }
  }
  await FootfallLog.insertMany(footfallDocs);

  // Users: 1 admin + 1 login per facility
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  await User.create({
    username: "admin",
    passwordHash: adminPasswordHash,
    name: "District Admin",
    role: "admin",
    facility: null,
  });

  const facilityCreds = [
    { username: "ghatampur.chc", password: "Ghatampur@123", name: "Ghatampur CHC Staff", facility: facilities[0]._id },
    { username: "rura.phc", password: "Rura@123", name: "Rura PHC Staff", facility: facilities[1]._id },
    { username: "bhognipur.phc", password: "Bhognipur@123", name: "Bhognipur PHC Staff", facility: facilities[2]._id },
  ];

  for (const cred of facilityCreds) {
    const passwordHash = await bcrypt.hash(cred.password, 10);
    await User.create({
      username: cred.username,
      passwordHash,
      name: cred.name,
      role: "facility",
      facility: cred.facility,
    });
  }

  console.log("\nSeed complete. Login credentials:");
  console.log("  Admin      -> username: admin           password: Admin@123");
  facilityCreds.forEach((c) => console.log(`  ${c.name.padEnd(22)} -> username: ${c.username.padEnd(15)} password: ${c.password}`));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
