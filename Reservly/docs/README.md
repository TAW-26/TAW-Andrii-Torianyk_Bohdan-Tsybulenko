# Reservly

> Andrii Torianyk 37742 · Bohdan Tsybulenko 38049  
> Projekt TAW II — Akademia Tarnowska

Aplikacja webowa do rezerwacji boisk i obiektów sportowych. 

---

## Wymagania

- Node.js ≥ 18
- npm ≥ 9
- Angular CLI ≥ 17 → `npm install -g @angular/cli`
- MongoDB (lokalnie lub Atlas)

---

## Uruchomienie 

### 1. Klonowanie
```bash
git clone <URL>
cd Reservly
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev            # http://localhost:3000
```

### 3. Frontend
```bash
cd frontend
npm install
ng serve               # http://localhost:4200
```

---
---

## Technologie

| Warstwa     | Technologie                              |
|-------------|------------------------------------------|
| Frontend    | Angular 17, TypeScript |
| Backend     | Node.js, Express, JWT, Mongoose          |
| Baza danych | MongoDB                                  |