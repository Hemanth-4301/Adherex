import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  tableName: {
    type: String,
    required: true,
    trim: true
  },
  tabletQty: {
    type: Number,
    required: true,
    min: 0
  },
  timing: {
    type: String,
    required: true,
    default: 'Morning'
  },
  doctor: {
    type: String,
    default: '',
    trim: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
medicationSchema.index({ patient: 1 });

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;
