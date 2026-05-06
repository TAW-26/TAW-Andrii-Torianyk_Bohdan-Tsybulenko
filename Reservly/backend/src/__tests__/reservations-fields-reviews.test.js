require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.test') });
const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../app');

// ─── Helpers 

// Rejestracja zwykłego użytkownika i zwrot tokenu
const registerUser = async (suffix = '') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Testowy User', email: `user${suffix}@test.com`, password: 'haslo123' });
  return { token: res.body.token, userId: res.body.user.id };
};

// Rejestracja admina i zwrot tokenu
const registerAdmin = async () => {
  const User = require('../models/User');
  const user = await User.create({
    name: 'Admin Test',
    email: 'admin@test.com',
    password: 'haslo123',
    role: 'admin',
  });
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { token, userId: user._id.toString() };
};

// Tworzenie boiska przez admina
const createField = async (adminToken, overrides = {}) => {
  const res = await request(app)
    .post('/api/fields')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Boisko Testowe',
      type: 'football',
      location: 'ul. Testowa 1',
      pricePerHour: 50,
      ...overrides,
    });
  return res.body;
};

// Tworzenie rezerwacji dla zalogowanego użytkownika
const createReservation = async (userToken, fieldId, overrides = {}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  return request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      fieldId,
      date: dateStr,
      startTime: '10:00',
      endTime: '12:00',
      ...overrides,
    });
};

// ─── Setup / Teardown

beforeAll(async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
});

beforeEach(async () => {
  const User        = require('../models/User');
  const Field       = require('../models/Field');
  const Reservation = require('../models/Reservation');
  const Review      = require('../models/Review');
  await Promise.all([
    User.deleteMany({}),
    Field.deleteMany({}),
    Reservation.deleteMany({}),
    Review.deleteMany({}),
  ]);
});

afterAll(async () => {
  await mongoose.connection.close();
});

// BOISKA

describe('GET /api/fields', () => {

  test('1. Pobranie listy boisk – zwraca tablicę (publiczny endpoint)', async () => {
    const { token: adminToken } = await registerAdmin();
    await createField(adminToken);

    const res = await request(app).get('/api/fields');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('name', 'Boisko Testowe');
  });

  test('2. Dodanie boiska przez admina – zwraca nowe boisko', async () => {
    const { token: adminToken } = await registerAdmin();

    const res = await request(app)
      .post('/api/fields')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Kort tenisowy', type: 'tennis', location: 'ul. Parkowa 1', pricePerHour: 40 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({ name: 'Kort tenisowy', type: 'tennis' });
  });

  test('3. Dodanie boiska przez zwykłego użytkownika – błąd 403', async () => {
    const { token: userToken } = await registerUser();

    const res = await request(app)
      .post('/api/fields')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Boisko', type: 'football', location: 'ul. X', pricePerHour: 30 });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Wymagane uprawnienia administratora');
  });

});

// REZERWACJE

describe('POST /api/reservations', () => {

  test('4. Tworzenie rezerwacji – zwraca nową rezerwację', async () => {
    const { token: adminToken } = await registerAdmin();
    const field = await createField(adminToken);
    const { token: userToken } = await registerUser();

    const res = await createReservation(userToken, field._id);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('startTime', '10:00');
    expect(res.body).toHaveProperty('endTime', '12:00');
    expect(res.body.field).toHaveProperty('name', 'Boisko Testowe');
  });

  test('5. Rezerwacja z konfliktem czasowym – błąd 409', async () => {
    const { token: adminToken } = await registerAdmin();
    const field = await createField(adminToken);
    const { token: userToken } = await registerUser('_a');

    // Pierwsza rezerwacja 10:00–12:00
    await createReservation(userToken, field._id);

    // Druga rezerwacja nakładająca się: 11:00–13:00
    const { token: userToken2 } = await registerUser('_b');
    const res = await createReservation(userToken2, field._id, {
      startTime: '11:00',
      endTime: '13:00',
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Wybrany termin jest już zajęty');
  });

  test('6. Rezerwacja z błędną kolejnością godzin – błąd 400', async () => {
    const { token: adminToken } = await registerAdmin();
    const field = await createField(adminToken);
    const { token: userToken } = await registerUser();

    const res = await createReservation(userToken, field._id, {
      startTime: '14:00',
      endTime: '10:00',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Godzina końca musi być późniejsza niż początku');
  });

  test('7. Rezerwacja bez tokenu – błąd 401', async () => {
    const { token: adminToken } = await registerAdmin();
    const field = await createField(adminToken);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res = await request(app)
      .post('/api/reservations')
      .send({ fieldId: field._id, date: tomorrow.toISOString().split('T')[0], startTime: '10:00', endTime: '12:00' });

    expect(res.statusCode).toBe(401);
  });

});

describe('PATCH /api/reservations/:id/cancel', () => {

  test('8. Anulowanie własnej rezerwacji – zwraca status cancelled', async () => {
    const { token: adminToken } = await registerAdmin();
    const field = await createField(adminToken);
    const { token: userToken } = await registerUser();

    const created = await createReservation(userToken, field._id);
    const reservationId = created.body._id;

    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.reservation.status).toBe('cancelled');
  });

  test('9. Anulowanie cudzej rezerwacji – błąd 403', async () => {
    const { token: adminToken } = await registerAdmin();
    const field = await createField(adminToken);

    const { token: ownerToken } = await registerUser('_owner');
    const created = await createReservation(ownerToken, field._id);
    const reservationId = created.body._id;

    const { token: otherToken } = await registerUser('_other');
    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Brak uprawnień do anulowania tej rezerwacji');
  });

});

// OPINIE

describe('POST /api/reviews', () => {

  test('10. Dodanie opinii bez rezerwacji – błąd 403', async () => {
    const { token: adminToken } = await registerAdmin();
    const field = await createField(adminToken);
    const { token: userToken } = await registerUser();

    // Użytkownik NIE ma rezerwacji na to boisko
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ fieldId: field._id, rating: 5, comment: 'Świetne!' });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Możesz oceniać tylko boiska, które zarezerwowałeś');
  });

});