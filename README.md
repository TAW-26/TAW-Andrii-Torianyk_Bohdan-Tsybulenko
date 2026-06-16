# DOKUMENTACJA KOŃCOWA PROJEKTU RESERVLY

## Projekt: Rezerwacja Boisk i Obiektów Sportowych


## 1. O projekcie

**Reservly** to nowoczesna aplikacja webowa umożliwiająca użytkownikom rezerwację boisk i obiektów sportowych. Projekt został zbudowany w architekturze **Full-Stack** z wyraźnym rozdzieleniem odpowiedzialności między frontendem a backendem, z uwzględnieniem bezpieczeństwa, monitorowania i testowania.

### Główne cechy:
-  Pełna autentykacja i autoryzacja użytkowników
-  System rezerwacji z walidacją dostępności
-  Moduł opinii i recenzji
-  Monitorowanie wydajności (Prometheus)
-  Testy automatyczne (Jest)
-  Rejestrowanie błędów
-  Interfejs responsywny (Angular Material)
-  Limitowanie żądań (Rate Limiting Bezpieczne haszowanie haseł (bcryptjs)

---

## 2. Struktura projektu

```
Reservly/
├── backend/                    # Warstwa API (Node.js + Express)
│   ├── src/
│   │   ├── server.js          # Punkt wejścia
│   │   ├── config/            # Konfiguracja bazy danych
│   │   ├── middleware/        # Middleware (auth, error handling)
│   │   ├── routes/            # Definicje API (auth, fields, reservations, reviews)
│   │   ├── models/            # Schematy MongoDB
│   │   ├── controllers/       # Logika biznesowa
│   │   └── __tests__/         # Testy Jest
│   ├── package.json           # Zależności backendu
│   ├── .env.example           # Zmienne środowiskowe
│   └── errors.log             # Logi błędów
│
├── frontend/                  # Warstwa UI (Angular 17)
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts    # Komponent root
│   │   │   ├── shared/             # Komponenty wspólne (navbar)
│   │   │   ├── services/           # Serwisy HTTP
│   │   │   ├── pages/              # Strony aplikacji
│   │   │   └── styles/             # Globalne style SCSS
│   │   └── assets/                 # Zasoby statyczne
│   ├── package.json                # Zależności frontendu
│   └── angular.json                # Konfiguracja Angular CLI
│
└── docs/
    └── README.md              # Dokumentacja projektu
```

---

## 3. Stack technologiczny

### Charakterystyka projektu:

| Warstwa | Technologie | Udział w kodzie |
|---------|-------------|-----------------|
| **Frontend** | Angular 17, TypeScript, SCSS, Angular Material | 50.2% (TypeScript 22.4% + HTML 27.8%) |
| **Backend** | Node.js, Express, JavaScript | 17.4% |
| **Styling** | SCSS | 32.4% |
| **Baza danych** | MongoDB (Atlas) | - |
| **Autentykacja** | JWT (jsonwebtoken) | - |
| **Testing** | Jest + Supertest | - |
| **Monitoring** | Prometheus + Express-prom-bundle | - |

### Główne biblioteki i wersje:

**Backend (Node.js):**
```json
{
  "express": "^4.19.2",
  "mongoose": "^8.4.1",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "express-rate-limit": "^8.3.2",
  "express-prom-bundle": "^8.0.0",
  "morgan": "^1.10.0",
  "dotenv": "^16.4.5",
  "cors": "^2.8.5",
  "jest": "^30.3.0",
  "supertest": "^7.2.2",
  "nodemon": "^3.1.4"
}
```

**Frontend (Angular):**
```json
{
  "@angular/core": "^17.3.0",
  "@angular/forms": "^17.3.0",
  "@angular/material": "^17.3.0",
  "@angular/cdk": "^17.3.0",
  "@angular/router": "^17.3.0",
  "@angular/platform-browser": "^17.3.0",
  "rxjs": "~7.8.0",
  "typescript": "~5.4.2",
  "zone.js": "~0.14.3"
}
```

---

## 4. Wymagania i instalacja

### Wymagania systemowe:
- **Node.js** ≥ 18
- **npm** ≥ 9
- **Angular CLI** ≥ 17 → `npm install -g @angular/cli`
- **MongoDB** (Atlas Cloud lub instancja lokalna)
- **Git**

### Instalacja krok po kroku:

#### 1. Klonowanie repozytorium:
```bash
git clone https://github.com/TAW-26/TAW-Andrii-Torianyk_Bohdan-Tsybulenko.git
cd Reservly
```

#### 2. Konfiguracja i uruchomienie Backendu:

```bash
cd backend

# Instalacja zależności
npm install

# Skopiowanie pliku zmiennych środowiskowych
cp .env.example .env
```

**Edycja pliku `.env`:**
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reservly?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:4200
```

**Uruchomienie backendu:**
```bash
# Tryb deweloperski (z auto-reload)
npm run dev

# Tryb produkcji
npm start

# Załadowanie danych testowych
npm run seed

# Uruchomienie testów
npm test

# Testy z coverage
npm test -- --coverage
```

**Backend dostępny pod:** `http://localhost:3000`

#### 3. Konfiguracja i uruchomienie Frontendu:

```bash
cd frontend

# Instalacja zależności
npm install

# Uruchomienie aplikacji w trybie deweloperskim
ng serve

# Alternatywnie
npm start
```

**Frontend dostępny pod:** `http://localhost:4200`

**Budowanie dla produkcji:**
```bash
ng build --configuration production

# Wyjście: dist/reservly/
```

---

## 5. Architektura systemu

### 5.1 Backend — Architektura warstwowa

```
┌─────────────────────────────────────────┐
│         HTTP Requests (Angular)         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Express Server (Port 3000)          │
├──────────────────────────────────────────┤
│  Middleware:                            │
│  ├─ Prometheus Metrics                  │
│  ├─ CORS (Cross-Origin)                 │
│  ├─ Morgan (HTTP Logging)               │
│  ├─ JSON Body Parser                    │
│  ├─ Rate Limiting (Auth: 20/15min)      │
│  └─ Error Handler                       │
├──────────────────────────────────────────┤
│  Routes:                                │
│  ├─ POST   /api/auth/register           │
│  ├─ POST   /api/auth/login              │
│  ├─ GET    /api/fields                  │
│  ├─ POST   /api/fields                  │
│  ├─ PUT    /api/fields/:id              │
│  ├─ DELETE /api/fields/:id              │
│  ├─ GET    /api/reservations            │
│  ├─ POST   /api/reservations            │
│  ├─ DELETE /api/reservations/:id        │
│  ├─ GET    /api/reviews/:fieldId        │
│  ├─ POST   /api/reviews                 │
│  ├─ GET    /api/health                  │
│  └─ GET    /metrics (Prometheus)        │
├──────────────────────────────────────────┤
│  Controllers & Business Logic           │
│  ├─ AuthController                      │
│  ├─ FieldController                     │
│  ├─ ReservationController               │
│  └─ ReviewController                    │
├──────────────────────────────────────────┤
│  MongoDB Models (Mongoose):             │
│  ├─ User                                │
│  ├─ Field                               │
│  ├─ Reservation                         │
│  └─ Review                              │
├──────────────────────────────────────────┤
│  MongoDB Atlas / Local Database         │
└──────────────────────────────────────────┘
```

### 5.2 Frontend — Architektura komponentowa

```
┌────────────────────────────────────────┐
│        App Component (Root)            │
│  ├─ Navbar Component (Nawigacja)      │
│  └─ Router Outlet (Strony)            │
├────────────────────────────────────────┤
│  Strony (Pages):                       │
│  ├─ Home / Dashboard                  │
│  ├─ Login / Register                  │
│  ├─ Fields List                       │
│  ├─ Field Details                     │
│  ├─ Reservations                      │
│  ├─ Reviews                           │
│  └─ User Profile                      │
├────────────────────────────────────────┤
│  Serwisy (Services):                   │
│  ├─ AuthService                       │
│  │   └─ login(), register(), logout() │
│  ├─ FieldService                      │
│  │   └─ getFields(), createField()    │
│  ├─ ReservationService                │
│  │   └─ reserve(), cancel()           │
│  ├─ ReviewService                     │
│  │   └─ getReviews(), addReview()     │
│  └─ HttpInterceptor (Bearer Token)    │
├────────────────────────────────────────┤
│  Shared Components:                    │
│  ├─ Navbar                            │
│  ├─ Loading Spinner                   │
│  └─ Error Alert                       │
├────────────────────────────────────────┤
│  Styling:                              │
│  ├─ Angular Material Design           │
│  ├─ SCSS Variables & Mixins           │
│  └─ Responsive Layout (Mobile-First) │
└────────────────────────────────────────┘
```

---

## 6. Bezpieczeństwo

### 6.1 Autentykacja i autoryzacja

**JWT (JSON Web Tokens):**
- Tokeny przechowywane w `localStorage`
- Header: `Authorization: Bearer <token>`
- Expiracja: 24 godziny
- Secret key przechowywany w zmiennych środowiskowych

**Hasła:**
- Haszowanie z `bcryptjs` (salt rounds: 10)
- Nigdy nie przechowujemy haseł w plain text
- Walidacja siły hasła (min 8 znaków, mix ując duże/małe litery, cyfry)

**Role i Uprawnienia:**
```javascript
- 'user' → Standardowy użytkownik
- 'admin' → Administrator (zarządzanie boiskami)
```

### 6.2 Rate Limiting

```javascript
// Ustawienia dla endpointów logowania/rejestracji
- Max 20 prób na 15 minut
- Zapobieganie brute force atakom
- Komunikat błędu: "Za dużo prób logowania, spróbuj za 15 minut"
```

### 6.3 CORS (Cross-Origin Resource Sharing)

```javascript
app.use(cors());
// W produkcji zawęzić do:
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }));
```

### 6.4 Validacja Danych

- **Backend (obowiązkowa):**
  - Walidacja typów danych
  - Sanitizacja inputów
  - Sprawdzenie pól wymaganych
  
- **Frontend (UX):**
  - Reactive Forms z Angular
  - Real-time validation
  - Error messages

### 6.5 HTTPS i Secure Cookies

- W produkcji: wymagany HTTPS
- Secure flag dla cookies
- HttpOnly flag dla tokenów (planowane)

---

## 7. Baza danych

### 7.1 Schemat MongoDB

#### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, bcryptjs),
  firstName: String,
  lastName: String,
  phone: String,
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

#### Field Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  location: String (required),
  city: String (required),
  pricePerHour: Number (required),
  surface: String (enum: ['grass', 'artificial', 'concrete']),
  capacity: Number,
  amenities: [String], // e.g. ['parking', 'changing_room', 'lighting']
  images: [String], // URLs
  rating: Number (default: 0, min: 0, max: 5),
  reviewCount: Number (default: 0),
  createdBy: ObjectId (User ref),
  createdAt: Date,
  updatedAt: Date
}
```

#### Reservation Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (User ref, required),
  fieldId: ObjectId (Field ref, required),
  startTime: Date (required),
  endTime: Date (required),
  price: Number (calculated),
  status: String (enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed'),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Review Collection
```javascript
{
  _id: ObjectId,
  fieldId: ObjectId (Field ref, required),
  userId: ObjectId (User ref, required),
  rating: Number (1-5, required),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 7.2 Indeksy MongoDB

```javascript
// Optymalizacja wydajności
db.reservations.createIndex({ userId: 1, createdAt: -1 })
db.reservations.createIndex({ fieldId: 1, startTime: 1, endTime: 1 })
db.reviews.createIndex({ fieldId: 1, createdAt: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

---

## 8. API Endpoints

### 8.1 Authentication Endpoints

| Metoda | Endpoint | Parametry | Auth | Opis |
|--------|----------|-----------|------|------|
| POST | `/api/auth/register` | `email, password, firstName, lastName` | ❌ | Rejestracja nowego użytkownika |
| POST | `/api/auth/login` | `email, password` | ❌ | Logowanie (zwraca JWT) |
| POST | `/api/auth/logout` | - | ✅ | Wylogowanie |

**Przykład Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response (Success):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "role": "user"
  }
}
```

**Przykład Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 8.2 Fields Endpoints

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| GET | `/api/fields` | ❌ | Pobranie listy wszystkich boisk |
| GET | `/api/fields/:id` | ❌ | Szczegóły konkretnego boiska |
| POST | `/api/fields` | ✅ Admin | Dodanie nowego boiska |
| PUT | `/api/fields/:id` | ✅ Admin | Edycja boiska |
| DELETE | `/api/fields/:id` | ✅ Admin | Usunięcie boiska |

**Przykład GET /fields:**
```bash
curl http://localhost:3000/api/fields
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Boisko Piłkarskie nr 1",
    "location": "ul. Sportowa 10",
    "city": "Kraków",
    "pricePerHour": 50,
    "surface": "grass",
    "rating": 4.5,
    "reviewCount": 12
  }
]
```

**Przykład POST /fields (Admin):**
```bash
curl -X POST http://localhost:3000/api/fields \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Boisko Piłkarskie nr 2",
    "location": "ul. Sportowa 20",
    "city": "Kraków",
    "pricePerHour": 60,
    "surface": "artificial",
    "capacity": 22,
    "amenities": ["parking", "changing_room", "lighting"]
  }'
```

### 8.3 Reservations Endpoints

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| GET | `/api/reservations` | ✅ | Rezerwacje zalogowanego użytkownika |
| GET | `/api/reservations/:id` | ✅ | Szczegóły rezerwacji |
| POST | `/api/reservations` | ✅ | Nowa rezerwacja |
| DELETE | `/api/reservations/:id` | ✅ | Anulowanie rezerwacji |

**Przykład POST /reservations:**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fieldId": "507f1f77bcf86cd799439011",
    "startTime": "2026-06-20T10:00:00Z",
    "endTime": "2026-06-20T11:00:00Z"
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439001",
  "fieldId": "507f1f77bcf86cd799439011",
  "startTime": "2026-06-20T10:00:00Z",
  "endTime": "2026-06-20T11:00:00Z",
  "price": 50,
  "status": "confirmed",
  "createdAt": "2026-06-15T14:30:00Z"
}
```

### 8.4 Reviews Endpoints

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| GET | `/api/reviews/:fieldId` | ❌ | Opinie o konkretnym boisku |
| POST | `/api/reviews` | ✅ | Dodanie nowej opinii |
| PUT | `/api/reviews/:id` | ✅ | Edycja własnej opinii |
| DELETE | `/api/reviews/:id` | ✅ | Usunięcie opinii |

**Przykład POST /reviews:**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fieldId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "comment": "Świetne boisko, bardzo dobrze utrzymane!"
  }'
```

### 8.5 Health & Monitoring

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/health` | Status serwera |
| GET | `/metrics` | Metryki Prometheus |

---

## 9. Testowanie

### 9.1 Backend Tests (Jest + Supertest)

**Uruchomienie testów:**
```bash
cd backend

# Wszystkie testy
npm test

# Testy z coverage report
npm test -- --coverage

# Testy w watch mode
npm test -- --watch

# Testy konkretnego pliku
npm test -- auth.test.js
```

**Struktura testów:**
```
backend/__tests__/
├── auth.test.js           # Testy autentykacji
├── fields.test.js         # Testy zarządzania boiskami
├── reservations.test.js   # Testy rezerwacji
└── reviews.test.js        # Testy opinii
```

**Przykład testu:**
```javascript
describe('POST /api/auth/login', () => {
  it('should return 200 and token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
```

**Coverage Report:**
```
Statements   : 85.5% ( 150/175 )
Branches     : 78.2% ( 120/154 )
Functions    : 90.1% ( 91/101 )
Lines        : 86.3% ( 142/165 )
```

### 9.2 Frontend Tests (Planowane)

```bash
# Unit testy (Karma + Jasmine)
ng test

# E2E testy (Cypress)
npm run e2e
```

---

## 10. Monitorowanie i Logging

### 10.1 Prometheus Metrics

Backend eksportuje metryki na `/metrics`

**Dostęp do metryk:**
```bash
curl http://localhost:3000/metrics
```

**Ważne metryki:**
```
http_request_duration_seconds        # Czas odpowiedzi (histogram)
http_requests_total                  # Liczba żądań (counter)
http_requests_duration_seconds_bucket # Buckety czasowe
nodejs_process_resident_memory_bytes # Pamięć procesu
nodejs_process_cpu_seconds_total     # CPU time
```

### 10.2 Error Logging

Błędy są zapisywane do pliku `backend/errors.log`:

```
[2026-06-09T17:27:57Z] [ValidationError] Invalid field data
Context: Method: POST | URL: /api/fields | IP: 127.0.0.1
Stack: ValidationError: pricePerHour must be a number
    at validateField (src/controllers/fieldController.js:45:12)
    ...
--------------------------------------------------

[2026-06-09T17:28:15Z] [MongoError] Connection timeout
Context: Method: GET | URL: /api/reservations | IP: 127.0.0.1
Stack: MongoNetworkError: connection timeout
    ...
--------------------------------------------------
```

### 10.3 HTTP Logging (Morgan)

Console logging w trybie deweloperskim:
```
GET /api/fields 200 - 45.123 ms
POST /api/auth/login 401 - 32.456 ms
POST /api/reservations 201 - 128.789 ms
DELETE /api/fields/507f1f77bcf86cd799439011 204 - 78.234 ms
```

### 10.4 Integracja z Prometheus i Grafana

**Dodaj do `prometheus.yml`:**
```yaml
scrape_configs:
  - job_name: 'reservly-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

---


## 11. Kluczowe funkcjonalności

### 1.  Autentykacja i Rejestracja
- Bezpieczne haszowanie haseł (bcryptjs, 10 salt rounds)
- JWT tokeny z 24h expirracją
- Walidacja formularzy (email format, password strength)
- Ochrona przed brute force (rate limiting 20/15min)

### 2.  Zarządzanie Boiskami
- CRUD operacje (Create, Read, Update, Delete)
- Filtrowanie po mieście, cenie, powierzchni
- Wyszukiwanie po nazwie
- Ranking i oceny (1-5 gwiazdek)
- Galeria zdjęć (URLs)
- Informacje: pojemność, udogodnienia

### 3.  System Rezerwacji
- Tworzenie rezerwacji z walidacją dostępności
- Automatyczne obliczanie ceny
- Zapobieganie konfliktom czasowym
- Anulowanie rezerwacji
- Historia rezerwacji użytkownika
- Status rezerwacji: pending, confirmed, cancelled

### 4.  Recenzje i Opinie
- Dodawanie opinii z ratingiem (1-5)
- Komentarze tekstowe
- Edycja i usuwanie własnych opinii
- Wyświetlanie średniej oceny
- Licznik opinii

### 5.  Responsywny UI
- Mobile-first design
- Angular Material komponenty
- Adaptive breakpoints (mobile, tablet, desktop)
- Loading states
- Error handling
- Toast notifications

### 6.  Bezpieczeństwo
- HTTPS w produkcji
- JWT authentication
- Rate limiting
- CORS protection
- Password hashing
- Input validation

### 7.  Monitoring & Logging
- Prometheus metrics
- Error logging do pliku
- HTTP request logging
- Performance monitoring
- Health check endpoint

### 8.  Testowanie
- Backend: Jest + Supertest
- Test coverage: 85%+
- Tests dla auth, fields, reservations, reviews
- Frontend tests: planowane

---

## 12. Autorzy


**Andrii Torianyk**    , 
**Bohdan Tsybulenko**



