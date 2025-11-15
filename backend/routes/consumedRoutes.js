import express from 'express';
import Consumed from '../models/Consumed.js';
import Medication from '../models/Medication.js';

const router = express.Router();

// Get all consumed records for a patient
router.get('/bypatient/:p_id', async (req, res) => {
  try {
    const { p_id } = req.params;
    
    // Validate patient ID
    if (!p_id || p_id === 'undefined' || p_id === 'null') {
      return res.status(400).json({ message: 'Invalid patient ID provided' });
    }
    
    // Find all medications for this patient first
    const medications = await Medication.find({ patient: p_id });
    const medicationIds = medications.map(med => med._id);
    
    // Find all consumed records for these medications
    const consumedRecords = await Consumed.find({ medication: { $in: medicationIds } })
      .populate({
        path: 'medication',
        populate: {
          path: 'patient',
          select: 'name email'
        }
      })
      .sort({ dateTime: -1 });
    
    res.json(consumedRecords);
  } catch (error) {
    console.error('Error fetching consumed records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add consumed record (used by monitoring system)
router.post('/add', async (req, res) => {
  try {
    const { medicationId, dateTime } = req.body;
    
    const consumed = new Consumed({
      medication: medicationId,
      dateTime: dateTime || new Date()
    });
    
    await consumed.save();
    
    res.status(201).json({ 
      message: 'Consumed record added successfully',
      consumed 
    });
  } catch (error) {
    console.error('Error adding consumed record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
