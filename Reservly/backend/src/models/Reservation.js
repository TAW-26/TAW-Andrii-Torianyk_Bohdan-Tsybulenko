const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  field:     { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  date:      { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
  status:    { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

reservationSchema.index({ field: 1, date: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);