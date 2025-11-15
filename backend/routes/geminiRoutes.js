import express from 'express';
import Consumed from '../models/Consumed.js';
import Medication from '../models/Medication.js';
import { generateAIResponse } from '../config/geminiService.js';

const router = express.Router();

// Ask Gemini AI about medications
router.post('/ask', async (req, res) => {
  try {
    const { prompt, pid } = req.body;
    
    if (!prompt || !pid) {
      return res.status(400).json({ 
        message: 'Prompt and patient ID are required',
        aiResponse: 'Missing required parameters'
      });
    }
    
    // Find all medications for this patient
    const medications = await Medication.find({ patient: pid });
    const medicationIds = medications.map(med => med._id);
    
    // Build context about patient's medications and consumption
    let medsSummary = '';
    
    if (medications.length > 0) {
      medsSummary += 'Patient Medications:\n';
      medications.forEach(med => {
        const timing = Array.isArray(med.timing) ? med.timing.join(', ') : med.timing;
        medsSummary += `• ${med.tableName} - Prescribed by: Dr. ${med.doctor}, Timing: ${timing}, Quantity: ${med.tabletQty}\n`;
      });
      medsSummary += '\n';
    }
    
    // Find consumed records if available
    if (medicationIds.length > 0) {
      const consumedList = await Consumed.find({ medication: { $in: medicationIds } })
        .populate('medication')
        .sort({ dateTime: -1 })
        .limit(50); // Limit to recent 50 records
      
      if (consumedList && consumedList.length > 0) {
        // Group consumed entries by medication name
        const groupedByMedication = {};
        
        consumedList.forEach(consumed => {
          if (consumed.medication) {
            const medName = consumed.medication.tableName;
            if (!groupedByMedication[medName]) {
              groupedByMedication[medName] = [];
            }
            groupedByMedication[medName].push(consumed);
          }
        });
        
        medsSummary += 'Recent Medication Consumption:\n';
        
        for (const [medName, meds] of Object.entries(groupedByMedication)) {
          const dates = [...new Set(meds.map(c => {
            const date = new Date(c.dateTime);
            return date.toISOString().split('T')[0];
          }))].sort().slice(-7); // Last 7 unique dates
          
          medsSummary += `• ${medName}: Taken on ${dates.join(', ')}\n`;
        }
        medsSummary += '\n';
      }
    }
    
    // Generate AI response with context (or without if no data available)
    const systemContext = `You are a compassionate mental health support assistant for medication adherence. 
You provide emotional support, answer questions about medication management, and offer coping strategies.
Be empathetic, encouraging, and supportive. If the user asks about their specific medications, use the provided data.
For general mental health questions, provide helpful advice and encouragement.`;
    
    const fullPrompt = medsSummary 
      ? `${systemContext}\n\nPatient Context:\n${medsSummary}\n\nUser Question: ${prompt}` 
      : `${systemContext}\n\nUser Question: ${prompt}`;
    
    const aiResponse = await generateAIResponse(fullPrompt);
    
    res.json({
      aiResponse,
      consumedSummary: medsSummary
    });
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ 
      aiResponse: 'Error fetching AI response.',
      consumedSummary: '',
      error: error.message 
    });
  }
});

export default router;
