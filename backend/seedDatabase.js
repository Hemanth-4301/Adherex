import mongoose from "mongoose";
import Consumed from "./models/Consumed.js";
import Medication from "./models/Medication.js";
import Patient from "./models/Patient.js";
import dotenv from "dotenv";
dotenv.config();

// Database connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/adherex",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Find the patient with email "h@gmail.com"
    const patient = await Patient.findOne({ email: "h@gmail.com" });

    if (!patient) {
      console.error("❌ Patient with email 'hem@gmail.com' not found!");
      console.log("Please register this patient first.");
      process.exit(1);
    }

    console.log(`✅ Found patient: ${patient.name} (ID: ${patient._id})`);

    // Find or create medications for this patient
    let aspirin = await Medication.findOne({
      patient: patient._id,
      tableName: "Aspirin",
    });

    if (!aspirin) {
      aspirin = await Medication.create({
        patient: patient._id,
        tableName: "Aspirin",
        tabletQty: 30,
        timing: "Morning",
        doctor: "Dr. Smith",
      });
      console.log("✅ Created Aspirin medication");
    }

    let dolo = await Medication.findOne({
      patient: patient._id,
      tableName: "dolo 65",
    });

    if (!dolo) {
      dolo = await Medication.create({
        patient: patient._id,
        tableName: "dolo 65",
        tabletQty: 20,
        timing: "Morning, Afternoon",
        doctor: "Dr. Smith",
      });
      console.log("✅ Created dolo 65 medication");
    }

    let vitamin = await Medication.findOne({
      patient: patient._id,
      tableName: "Vitamin D",
    });

    if (!vitamin) {
      vitamin = await Medication.create({
        patient: patient._id,
        tableName: "Vitamin D",
        tabletQty: 15,
        timing: "Morning",
        doctor: "Dr. Johnson",
      });
      console.log("✅ Created Vitamin D medication");
    }

    // Clear existing consumed data for this patient
    // First get all medications for this patient
    const patientMedications = await Medication.find({ patient: patient._id });
    const medIds = patientMedications.map(m => m._id);
    await Consumed.deleteMany({ medication: { $in: medIds } });
    console.log("🗑️  Cleared existing consumed data");

    // Generate consumed data for the last 7 days
    const consumedData = [];
    const today = new Date();

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      // Aspirin - Morning (7-10 AM with wide variations)
      const aspirinMorningTime = new Date(date);
      const aspirinHour = 7 + Math.floor(Math.random() * 3); // 7-9 AM
      aspirinMorningTime.setHours(aspirinHour, Math.floor(Math.random() * 60), 0);
      consumedData.push({
        dateTime: aspirinMorningTime,
        medication: aspirin._id,
      });

      // dolo 65 - Morning (6-9 AM with variations)
      const doloMorningTime = new Date(date);
      const doloMorningHour = 6 + Math.floor(Math.random() * 3); // 6-8 AM
      doloMorningTime.setHours(doloMorningHour, Math.floor(Math.random() * 60), 0);
      consumedData.push({
        dateTime: doloMorningTime,
        medication: dolo._id,
      });

      // dolo 65 - Afternoon (1-4 PM with variations)
      const doloAfternoonTime = new Date(date);
      const doloAfternoonHour = 13 + Math.floor(Math.random() * 3); // 1-3 PM
      doloAfternoonTime.setHours(doloAfternoonHour, Math.floor(Math.random() * 60), 0);
      consumedData.push({
        dateTime: doloAfternoonTime,
        medication: dolo._id,
      });

      // Vitamin D - Morning (8-11 AM with variations)
      const vitaminMorningTime = new Date(date);
      const vitaminHour = 8 + Math.floor(Math.random() * 3); // 8-10 AM
      vitaminMorningTime.setHours(vitaminHour, Math.floor(Math.random() * 60), 0);
      consumedData.push({
        dateTime: vitaminMorningTime,
        medication: vitamin._id,
      });

      // Add some evening doses for variety (every other day)
      if (daysAgo % 2 === 0) {
        // Aspirin - Evening (7-9 PM - late dose)
        const aspirinEvening = new Date(date);
        const eveningHour = 19 + Math.floor(Math.random() * 2); // 7-8 PM
        aspirinEvening.setHours(eveningHour, Math.floor(Math.random() * 60), 0);
        consumedData.push({
          dateTime: aspirinEvening,
          medication: aspirin._id,
        });
      }

      // Add occasional afternoon Aspirin doses (every 3 days)
      if (daysAgo % 3 === 0) {
        const aspirinAfternoon = new Date(date);
        const afternoonHour = 14 + Math.floor(Math.random() * 2); // 2-3 PM
        aspirinAfternoon.setHours(afternoonHour, Math.floor(Math.random() * 60), 0);
        consumedData.push({
          dateTime: aspirinAfternoon,
          medication: aspirin._id,
        });
      }
    }

    // Insert all consumed data
    await Consumed.insertMany(consumedData);
    console.log(
      `✅ Added ${consumedData.length} consumption records for the last 7 days`
    );

    // Summary
    console.log("\n📊 Seeding Summary:");
    console.log(`   Patient: ${patient.name} (${patient.email})`);
    console.log(
      `   Medications: ${[
        aspirin.tableName,
        dolo.tableName,
        vitamin.tableName,
      ].join(", ")}`
    );
    console.log(`   Consumed records: ${consumedData.length}`);
    console.log(
      `   Date range: ${new Date(
        consumedData[0].dateTime
      ).toLocaleDateString()} to ${new Date(
        consumedData[consumedData.length - 1].dateTime
      ).toLocaleDateString()}`
    );
    console.log("\n✨ Database seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
