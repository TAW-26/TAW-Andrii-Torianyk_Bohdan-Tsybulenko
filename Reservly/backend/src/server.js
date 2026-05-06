require('dotenv').config();
const app       = require('./app');
const connectDB = require('./config/db');

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));