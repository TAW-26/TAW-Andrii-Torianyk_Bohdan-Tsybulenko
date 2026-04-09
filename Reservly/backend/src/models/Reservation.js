const mongoose = require('mongoose');

// Model rezerwacji boiska
const reservationSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  field:     { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  date:      { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
  // Status: potwierdzona / oczekująca / anulowana
  status:    { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

// Indeks dla szybkiego sprawdzania konfliktów czasowych
reservationSchema.index({ field: 1, date: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);