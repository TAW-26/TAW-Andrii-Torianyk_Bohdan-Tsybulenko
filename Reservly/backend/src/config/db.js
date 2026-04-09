const mongoose = require('mongoose');

// Połączenie z bazą danych MongoDB
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB połączone: ${conn.connection.host}`);
};

module.exports = connectDB;