# Reservly API — Dokumentacja

Base URL: `http://localhost:3000/api`

Chronione endpointy wymagają nagłówka:
```
Authorization: Bearer <token>
```

---

## Autoryzacja

### Rejestracja
```
POST /auth/register
```
**Body:**
```json
{
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "password": "haslo123"
}
```
**Odpowiedź 201:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Jan Kowalski",
    "email": "jan@example.com",
    "role": "user"
  }
}
```

---

### Logowanie
```
POST /auth/login
```
**Body:**
```json
{
  "email": "jan@example.com",
  "password": "haslo123"
}
```
**Odpowiedź 200:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Jan Kowalski",
    "email": "jan@example.com",
    "role": "user"
  }
}
```

---

### Dane zalogowanego użytkownika
```
GET /auth/me
```
 Wymaga tokenu

**Odpowiedź 200:**
```json
{
  "id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "role": "user"
}
```

---

## Boiska

### Pobierz wszystkie boiska
```
GET /fields
```
Publiczny endpoint. Opcjonalne parametry query:
- `type` — filtrowanie po typie (`football`, `basketball`, `tennis`, `volleyball`, `other`)
- `location` — filtrowanie po lokalizacji (częściowe dopasowanie)

**Przykład:** `GET /fields?type=football`

**Odpowiedź 200:**
```json
[
  {
    "_id": "69dd026344b55b82a413bd47",
    "name": "Boisko Orlik Centrum",
    "type": "football",
    "location": "ul. Sportowa 1, Tarnów",
    "pricePerHour": 50,
    "createdAt": "2026-04-13T14:49:07.703Z",
    "updatedAt": "2026-04-13T14:49:07.703Z"
  }
]
```

---

### Pobierz jedno boisko
```
GET /fields/:id
```
Publiczny endpoint.

**Odpowiedź 200:**
```json
{
  "_id": "69dd026344b55b82a413bd47",
  "name": "Boisko Orlik Centrum",
  "type": "football",
  "location": "ul. Sportowa 1, Tarnów",
  "pricePerHour": 50,
  "createdAt": "2026-04-13T14:49:07.703Z",
  "updatedAt": "2026-04-13T14:49:07.703Z"
}
```

---

### Dodaj boisko
```
POST /fields
```
 Wymaga tokenu admina

**Body:**
```json
{
  "name": "Nowe boisko",
  "type": "basketball",
  "location": "ul. Nowa 1, Kraków",
  "pricePerHour": 70
}
```
**Odpowiedź 201:** obiekt boiska

---

### Aktualizuj boisko
```
PUT /fields/:id
```
 Wymaga tokenu admina

**Body:** (dowolne pola do aktualizacji)
```json
{
  "pricePerHour": 80
}
```
**Odpowiedź 200:** zaktualizowany obiekt boiska

---

### Usuń boisko
```
DELETE /fields/:id
```
 Wymaga tokenu admina

**Odpowiedź 200:**
```json
{
  "message": "Boisko zostało usunięte"
}
```

---

## Rezerwacje

### Moje rezerwacje
```
GET /reservations/my
```
 Wymaga tokenu

**Odpowiedź 200:**
```json
[
  {
    "_id": "69de2b9e821a296376c314fc",
    "user": "69dd032c5c9dd6f0098e3e8f",
    "field": {
      "_id": "69dd026344b55b82a413bd47",
      "name": "Boisko Orlik Centrum",
      "type": "football",
      "location": "ul. Sportowa 1, Tarnów"
    },
    "date": "2026-04-20T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "12:00",
    "status": "confirmed"
  }
]
```

---

### Wszystkie rezerwacje
```
GET /reservations
```
 Wymaga tokenu admina

**Odpowiedź 200:** lista wszystkich rezerwacji z danymi użytkowników i boisk

---

### Dostępność boiska
```
GET /reservations/availability/:fieldId?date=YYYY-MM-DD
```
Publiczny endpoint.

**Przykład:** `GET /reservations/availability/69dd026344b55b82a413bd47?date=2026-04-20`

**Odpowiedź 200:**
```json
[
  {
    "startTime": "10:00",
    "endTime": "12:00"
  }
]
```

---

### Stwórz rezerwację
```
POST /reservations
```
 Wymaga tokenu

**Body:**
```json
{
  "fieldId": "69dd026344b55b82a413bd47",
  "date": "2026-04-20",
  "startTime": "10:00",
  "endTime": "12:00"
}
```
**Odpowiedź 201:**
```json
{
  "_id": "69de2b9e821a296376c314fc",
  "user": "69dd032c5c9dd6f0098e3e8f",
  "field": {
    "_id": "69dd026344b55b82a413bd47",
    "name": "Boisko Orlik Centrum",
    "type": "football",
    "location": "ul. Sportowa 1, Tarnów"
  },
  "date": "2026-04-20T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "12:00",
  "status": "confirmed"
}
```

---

### Zmień termin rezerwacji
```
PATCH /reservations/:id
```
 Wymaga tokenu (tylko właściciel rezerwacji)

**Body:**
```json
{
  "date": "2026-04-25",
  "startTime": "14:00",
  "endTime": "16:00"
}
```
**Odpowiedź 200:** zaktualizowany obiekt rezerwacji

---

### Anuluj rezerwację
```
PATCH /reservations/:id/cancel
```
 Wymaga tokenu (właściciel rezerwacji lub admin)

**Odpowiedź 200:**
```json
{
  "message": "Rezerwacja została anulowana",
  "reservation": {
    "_id": "69de2b9e821a296376c314fc",
    "status": "cancelled"
  }
}
```

---

## Opinie

### Opinie o boisku
```
GET /reviews/field/:fieldId
```
Publiczny endpoint.

**Odpowiedź 200:**
```json
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "user": {
      "_id": "69dd026244b55b82a413bd42",
      "name": "Jan Kowalski"
    },
    "field": "69dd026344b55b82a413bd47",
    "rating": 5,
    "comment": "Świetne boisko, polecam!",
    "createdAt": "2026-04-13T14:49:08.093Z"
  }
]
```

---

### Dodaj opinię
```
POST /reviews
```
 Wymaga tokenu (tylko użytkownicy którzy mają potwierdzoną rezerwację tego boiska)

**Body:**
```json
{
  "fieldId": "69dd026344b55b82a413bd47",
  "rating": 5,
  "comment": "Świetne boisko, polecam!"
}
```
**Odpowiedź 201:** obiekt opinii

---

### Usuń opinię
```
DELETE /reviews/:id
```
 Wymaga tokenu (właściciel opinii lub admin)

**Odpowiedź 200:**
```json
{
  "message": "Opinia została usunięta"
}
```

---

## Kody błędów

| Kod | Opis |
|-----|------|
| 400 | Nieprawidłowe dane wejściowe |
| 401 | Brak lub nieprawidłowy token JWT |
| 403 | Brak uprawnień |
| 404 | Zasób nie został znaleziony |
| 409 | Konflikt (np. termin już zajęty) |
| 429 | Za dużo prób logowania (rate limiting) |
| 500 | Wewnętrzny błąd serwera |

---

## Dane testowe

Po uruchomieniu `node src/seed.js` dostępne są następujące konta:

| Rola | Email | Hasło |
|------|-------|-------|
| Admin | admin@reservly.com | Admin1234 |
| User | jan@reservly.com | User1234 |
| User | anna@reservly.com | User1234 |