const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Model użytkownika systemu
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Hasło nie jest zwracane domyślnie w zapytaniach
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Hashowanie hasła przed zapisem
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Porównanie hasła podczas logowania
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);