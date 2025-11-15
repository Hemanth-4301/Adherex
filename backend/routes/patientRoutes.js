import express from 'express';
import Patient from '../models/Patient.js';
import { sendEmail } from '../config/emailService.js';

const router = express.Router();

// Get Patient by ID
router.get('/getById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ message: '❌ Invalid patient ID provided!' });
    }
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ message: '❌ Patient not found!' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register new patient
router.post('/register', async (req, res) => {
  try {
    const { email, name, password, careTakerEmail, description, bp, regularDoctor } = req.body;
    
    // Check if email already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already registered!' });
    }
    
    // Create new patient
    const patient = new Patient({
      name,
      email,
      password, // In production, hash this with bcrypt
      careTakerEmail,
      description,
      bp,
      regularDoctor,
      alert: false
    });
    
    await patient.save();
    
    // Send welcome email to patient
    const patientMessage = `💖 Hello ${name},

Welcome to our HealthCare System! 🎉
We are so happy to have you onboard.

👉 Your login details are:
Email: ${email}
Password: ${password}

Please keep this safe. ${careTakerEmail ? `If you ever need help, your caretaker ${careTakerEmail} is here to support you. 🤗` : ''}

Stay healthy & take care!

💊 Your HealthCare Team`;
    
    await sendEmail(email, 'Welcome to HealthCare! 💖', patientMessage);
    
    // Send email to caretaker if provided
    if (careTakerEmail) {
      const caretakerMessage = `Hello CareTaker,

Your patient ${name} has registered successfully.
Here are their login details:
Email: ${email}
Password: ${password}

Please support them with love & care 💖.

Thanks,
HealthCare Team`;
      
      await sendEmail(careTakerEmail, 'CareTaker Notification 💌', caretakerMessage);
    }
    
    res.status(201).json({ 
      message: 'Registration successful! Login details sent to patient and caretaker.',
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if patient exists
    let patient = await Patient.findOne({ email });
    
    if (patient) {
      // Patient login
      if (patient.password !== password) {
        return res.status(401).json({ message: '❌ Invalid password!' });
      }
      
      return res.json({
        role: 'patient',
        patient: patient
      });
    }
    
    // Check if caretaker
    patient = await Patient.findOne({ careTakerEmail: email });
    
    if (patient) {
      // Caretaker login
      if (patient.password !== password) {
        return res.status(401).json({ message: '❌ Invalid password!' });
      }
      
      return res.json({
        role: 'caretaker',
        patient: patient
      });
    }
    
    return res.status(404).json({ message: '❌ User not found!' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update patient
router.put('/update/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found!' });
    }
    
    res.json({ message: 'Patient updated successfully!', patient });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update patient profile
router.put('/update/:pid', async (req, res) => {
  try {
    const { name, email, password, description, bp, regularDoctor, careTakerEmail } = req.body;
    
    const patient = await Patient.findById(req.params.pid);
    
    if (!patient) {
      return res.status(404).json({ message: `Patient with ID ${req.params.pid} not found` });
    }
    
    // Update fields
    patient.name = name;
    patient.email = email;
    patient.password = password;
    patient.description = description;
    patient.bp = bp;
    patient.regularDoctor = regularDoctor;
    patient.careTakerEmail = careTakerEmail;
    
    await patient.save();
    
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient profile:', error);
    res.status(500).json({ message: 'Error updating patient: ' + error.message });
  }
});

// Set alert to true
router.put('/setAlert/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: '❌ Patient not found!' });
    }
    
    patient.alert = true;
    await patient.save();
    
    res.json({ message: `🚨 Alert set to TRUE for patient: ${patient.name}` });
  } catch (error) {
    console.error('Error setting alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear alert
router.put('/clearAlert/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: '❌ Patient not found!' });
    }
    
    patient.alert = false;
    await patient.save();
    
    res.json({ message: `✅ Alert cleared (set to FALSE) for patient: ${patient.name}` });
  } catch (error) {
    console.error('Error clearing alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
