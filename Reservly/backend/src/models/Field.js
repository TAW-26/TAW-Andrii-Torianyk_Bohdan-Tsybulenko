const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  type:         { type: String, enum: ['football', 'basketball', 'tennis', 'volleyball', 'other'], required: true },
  location:     { type: String, required: true, trim: true },
  pricePerHour: { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Field', fieldSchema);