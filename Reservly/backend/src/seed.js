require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Field = require('./models/Field');
const Reservation = require('./models/Reservation');
const Review = require('./models/Review');

// Dane testowe – boiska
const fields = [
  { name: 'Boisko Orlik Centrum', type: 'football', location: 'ul. Sportowa 1, Tarnów', pricePerHour: 50 },
  { name: 'Kort tenisowy Park', type: 'tennis', location: 'ul. Parkowa 5, Tarnów', pricePerHour: 40 },
  { name: 'Hala koszykówki AWF', type: 'basketball', location: 'ul. Akademicka 3, Tarnów', pricePerHour: 60 },
  { name: 'Boisko siatkówki Plażowej', type: 'volleyball', location: 'ul. Plażowa 2, Tarnów', pricePerHour: 30 },
];

// Dane testowe – użytkownicy
const users = [
  { name: 'Admin Reservly', email: 'admin@reservly.com', password: 'Admin1234', role: 'admin' },
  { name: 'Jan Kowalski', email: 'jan@reservly.com', password: 'User1234', role: 'user' },
  { name: 'Anna Nowak', email: 'anna@reservly.com', password: 'User1234', role: 'user' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB połączone');

  // Czyszczenie bazy przed seedowaniem
  await User.deleteMany();
  await Field.deleteMany();
  await Reservation.deleteMany();
  await Review.deleteMany();
  console.log('Baza wyczyszczona');

  // Tworzenie użytkowników
  const createdUsers = await User.create(users);
  console.log(`Utworzono ${createdUsers.length} użytkowników`);

  const admin = createdUsers[0];
  const jan   = createdUsers[1];
  const anna  = createdUsers[2];

  // Tworzenie boisk
  const createdFields = await Field.create(fields);
  console.log(`Utworzono ${createdFields.length} boisk`);

  const fieldFootball   = createdFields[0];
  const fieldTennis     = createdFields[1];
  const fieldBasketball = createdFields[2];

  // Tworzenie rezerwacji (daty w przyszłości)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const reservations = await Reservation.create([
    {
      user: jan._id,
      field: fieldFootball._id,
      date: tomorrow,
      startTime: '10:00',
      endTime: '12:00',
      status: 'confirmed',
    },
    {
      user: anna._id,
      field: fieldTennis._id,
      date: tomorrow,
      startTime: '14:00',
      endTime: '15:00',
      status: 'confirmed',
    },
    {
      user: jan._id,
      field: fieldBasketball._id,
      date: nextWeek,
      startTime: '09:00',
      endTime: '11:00',
      status: 'confirmed',
    },
  ]);
  console.log(`Utworzono ${reservations.length} rezerwacji`);

  // Tworzenie opinii
  await Review.create([
    {
      user: jan._id,
      field: fieldFootball._id,
      rating: 5,
      comment: 'Świetne boisko, polecam!',
    },
    {
      user: anna._id,
      field: fieldTennis._id,
      rating: 4,
      comment: 'Dobry kort, czyste nawierzchnie.',
    },
  ]);
  console.log('Utworzono 2 opinie');

  console.log('\n=== Dane logowania ===');
  console.log('Admin:  admin@reservly.com  /  Admin1234');
  console.log('User 1: jan@reservly.com    /  User1234');
  console.log('User 2: anna@reservly.com   /  User1234');

  await mongoose.disconnect();
  console.log('\nSeeding zakończony pomyślnie!');
};

seed().catch((err) => {
  console.error('Błąd seedowania:', err);
  process.exit(1);
});