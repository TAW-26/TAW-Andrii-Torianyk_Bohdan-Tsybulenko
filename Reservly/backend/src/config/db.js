const mongoose = require('mongoose');

// Połączenie z bazą danych MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB połączone: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Błąd połączenia z MongoDB: ${error.message}`);
    process.exit(1); // zatrzyma serwer jeśli baza niedostępna
  }
};

module.exports = connectDB;