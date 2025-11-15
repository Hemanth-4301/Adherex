import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  bp: {
    type: String,
    default: ''
  },
  regularDoctor: {
    type: String,
    default: ''
  },
  careTakerEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  alert: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries (email already indexed via unique: true)
patientSchema.index({ careTakerEmail: 1 });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
