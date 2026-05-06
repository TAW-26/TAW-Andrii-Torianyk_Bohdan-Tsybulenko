require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.test') });
const request    = require('supertest');
const mongoose   = require('mongoose');
const app        = require('../app');

// Połączenie z testową bazą danych przed wszystkimi testami
beforeAll(async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
});

// Czyszczenie kolekcji użytkowników przed każdym testem
beforeEach(async () => {
  const User = require('../models/User');
  await User.deleteMany({});
});

// Rozłączenie z bazą po wszystkich testach
afterAll(async () => {
  await mongoose.connection.close();
});

// REJESTRACJA

describe('POST /api/auth/register', () => {

  test('1. Rejestracja nowego użytkownika – zwraca token i dane', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jan Kowalski', email: 'jan@test.com', password: 'haslo123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      name:  'Jan Kowalski',
      email: 'jan@test.com',
      role:  'user',
    });
  });

  test('2. Rejestracja z już zajętym emailem – błąd 400', async () => {
    // Rejestrujemy użytkownika
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jan Kowalski', email: 'jan@test.com', password: 'haslo123' });

    // Próba rejestracji z tym samym emailem
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Inny User', email: 'jan@test.com', password: 'haslo123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email jest już zajęty');
  });

  test('3. Rejestracja z za krótkim hasłem – błąd 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jan Kowalski', email: 'jan@test.com', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('4. Rejestracja bez emaila – błąd 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jan Kowalski', password: 'haslo123' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

});

// LOGOWANIE

describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    // Tworzymy użytkownika przed testami logowania
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jan Kowalski', email: 'jan@test.com', password: 'haslo123' });
  });

  test('5. Logowanie z poprawnymi danymi – zwraca token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jan@test.com', password: 'haslo123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('jan@test.com');
  });

  test('6. Logowanie z błędnym hasłem – błąd 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jan@test.com', password: 'zlehaslo' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Nieprawidłowy email lub hasło');
  });

  test('7. Logowanie z nieistniejącym emailem – błąd 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nieistnieje@test.com', password: 'haslo123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Nieprawidłowy email lub hasło');
  });

});

// CHRONIONY ENDPOINT /me

describe('GET /api/auth/me', () => {

  test('8. Bez tokenu – błąd 401', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak autoryzacji – nie podano tokenu');
  });

  test('9. Z nieprawidłowym tokenem – błąd 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer nieprawidlowytoken');

    expect(res.statusCode).toBe(401);
  });

  test('10. Z poprawnym tokenem – zwraca dane użytkownika', async () => {
    // Rejestracja i pobranie tokenu
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jan Kowalski', email: 'jan@test.com', password: 'haslo123' });

    const token = registerRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name:  'Jan Kowalski',
      email: 'jan@test.com',
      role:  'user',
    });
  });

});