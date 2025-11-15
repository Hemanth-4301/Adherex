import mongoose from 'mongoose';

const consumedSchema = new mongoose.Schema({
  dateTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  medication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
consumedSchema.index({ medication: 1 });
consumedSchema.index({ dateTime: -1 });

const Consumed = mongoose.model('Consumed', consumedSchema);

export default Consumed;
