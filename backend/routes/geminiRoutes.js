import express from "express";
import Consumed from "../models/Consumed.js";
import Medication from "../models/Medication.js";
import Patient from "../models/Patient.js";
import { generateAIResponse } from "../config/geminiService.js";

const router = express.Router();

// Ask Gemini AI about medications
router.post("/ask", async (req, res) => {
  try {
    const { prompt, pid } = req.body;

    if (!prompt || !pid) {
      return res.status(400).json({
        message: "Prompt and patient ID are required",
        aiResponse: "Missing required parameters",
      });
    }

    // Fetch patient details
    const patient = await Patient.findById(pid).select("-password");

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
        aiResponse: "Patient information not available",
      });
    }

    // Find all medications for this patient
    const medications = await Medication.find({ patient: pid });
    const medicationIds = medications.map((med) => med._id);

    // Build comprehensive context about patient
    let contextSummary = "";

    // Patient profile information
    contextSummary += "Patient Profile:\n";
    contextSummary += `• Name: ${patient.name}\n`;
    contextSummary += `• Email: ${patient.email}\n`;
    if (patient.description)
      contextSummary += `• Medical History/Notes: ${patient.description}\n`;
    if (patient.bp) contextSummary += `• Blood Pressure: ${patient.bp}\n`;
    if (patient.regularDoctor)
      contextSummary += `• Regular Doctor: Dr. ${patient.regularDoctor}\n`;
    if (patient.careTakerEmail)
      contextSummary += `• Caretaker: ${patient.careTakerEmail}\n`;
    contextSummary += "\n";

    // Medications information
    if (medications.length > 0) {
      contextSummary += "Current Medications:\n";
      medications.forEach((med) => {
        const timing = Array.isArray(med.timing)
          ? med.timing.join(", ")
          : med.timing;
        contextSummary += `• ${med.tableName} - Prescribed by: Dr. ${med.doctor}, Timing: ${timing}, Quantity: ${med.tabletQty}\n`;
      });
      contextSummary += "\n";
    } else {
      contextSummary += "No medications currently prescribed.\n\n";
    }

    // Find consumed records if available
    if (medicationIds.length > 0) {
      const consumedList = await Consumed.find({
        medication: { $in: medicationIds },
      })
        .populate("medication")
        .sort({ dateTime: -1 })
        .limit(50); // Limit to recent 50 records

      if (consumedList && consumedList.length > 0) {
        // Group consumed entries by medication name
        const groupedByMedication = {};

        consumedList.forEach((consumed) => {
          if (consumed.medication) {
            const medName = consumed.medication.tableName;
            if (!groupedByMedication[medName]) {
              groupedByMedication[medName] = [];
            }
            groupedByMedication[medName].push(consumed);
          }
        });

        contextSummary += "Recent Medication Consumption:\n";

        for (const [medName, meds] of Object.entries(groupedByMedication)) {
          const dates = [
            ...new Set(
              meds.map((c) => {
                const date = new Date(c.dateTime);
                return date.toISOString().split("T")[0];
              })
            ),
          ]
            .sort()
            .slice(-7); // Last 7 unique dates

          contextSummary += `• ${medName}: Taken on ${dates.join(", ")}\n`;
        }
        contextSummary += "\n";
      }
    }

    // Generate AI response with comprehensive context
    const systemContext = `You are a compassionate mental health support assistant for medication adherence. 
You provide emotional support, answer questions about medication management, and offer coping strategies.
Be empathetic, encouraging, and supportive. 

You have access to the patient's profile information, current medications, and medication consumption history.
When the user asks questions about themselves, their medications, their health, or their treatment plan, 
use the provided patient context to give personalized and relevant responses.

For general mental health questions, provide helpful advice and encouragement.
Always maintain patient privacy and speak in a warm, supportive tone.`;

    const fullPrompt = `${systemContext}\n\nPatient Context:\n${contextSummary}\n\nUser Question: ${prompt}`;

    const aiResponse = await generateAIResponse(fullPrompt);

    res.json({
      aiResponse,
      patientContext: contextSummary,
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({
      aiResponse: "Error fetching AI response.",
      patientContext: "",
      error: error.message,
    });
  }
});

export default router;
