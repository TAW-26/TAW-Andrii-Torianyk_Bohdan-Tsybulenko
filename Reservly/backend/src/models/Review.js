const mongoose = require('mongoose');

// Model opinii o boisku
const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  field:   { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
}, { timestamps: true });

// Jeden użytkownik może dodać tylko jedną opinię o danym boisku
reviewSchema.index({ user: 1, field: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);