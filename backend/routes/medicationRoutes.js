import express from 'express';
import Medication from '../models/Medication.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// Add a medication for a patient
router.post('/add/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Validate patient ID
    if (!patientId || patientId === 'undefined' || patientId === 'null') {
      return res.status(400).json({ message: 'Invalid patient ID provided' });
    }
    
    const { tableName, tabletQty, timing, doctor } = req.body;
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: `Patient not found with ID: ${patientId}` });
    }
    
    // Create new medication
    const medication = new Medication({
      tableName,
      tabletQty,
      timing,
      doctor,
      patient: patientId
    });
    
    await medication.save();
    
    res.status(201).json({ 
      message: `Medication added successfully for patient: ${patient.name}`,
      medication 
    });
  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all medications by patient ID
router.get('/get/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Validate patient ID
    if (!patientId || patientId === 'undefined' || patientId === 'null') {
      return res.status(400).json({ message: 'Invalid patient ID provided' });
    }
    
    const medications = await Medication.find({ patient: patientId })
      .populate('patient', 'name email');
    
    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing medication
router.put('/update/:mid', async (req, res) => {
  try {
    const { mid } = req.params;
    
    // Validate medication ID
    if (!mid || mid === 'undefined' || mid === 'null') {
      return res.status(400).json({ message: 'Invalid medication ID provided' });
    }
    
    const { tableName, tabletQty, timing, doctor } = req.body;
    
    const medication = await Medication.findById(mid);
    
    if (!medication) {
      return res.status(404).json({ message: `Medication not found with ID: ${mid}` });
    }
    
    // Update only provided fields
    if (tableName !== undefined) medication.tableName = tableName;
    if (tabletQty !== undefined) medication.tabletQty = tabletQty;
    if (timing !== undefined) medication.timing = timing;
    if (doctor !== undefined) medication.doctor = doctor;
    
    await medication.save();
    
    res.json({ 
      message: `Medication updated successfully (ID: ${mid})`,
      medication 
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a medication
router.delete('/delete/:mid', async (req, res) => {
  try {
    const { mid } = req.params;
    
    // Validate medication ID
    if (!mid || mid === 'undefined' || mid === 'null') {
      return res.status(400).json({ message: 'Invalid medication ID provided' });
    }
    
    const medication = await Medication.findByIdAndDelete(mid);
    
    if (!medication) {
      return res.status(404).json({ message: `Medication not found with ID: ${mid}` });
    }
    
    res.json({ message: `Medication deleted successfully (ID: ${mid})` });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
