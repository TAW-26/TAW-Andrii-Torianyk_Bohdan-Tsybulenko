const Reservation = require('../models/Reservation');
const Field = require('../models/Field');
const asyncHandler = require('../middleware/asyncHandler');

// Pomocnicza funkcja: zamiana czasu HH:MM na minuty
const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Sprawdzenie czy nowa rezerwacja koliduje z istniejącymi
const hasTimeConflict = (existing, startTime, endTime) => {
  const newStart = timeToMinutes(startTime);
  const newEnd   = timeToMinutes(endTime);
  return existing.some(r =>
    newStart < timeToMinutes(r.endTime) && newEnd > timeToMinutes(r.startTime)
  );
};

// GET /api/reservations/my – rezerwacje zalogowanego użytkownika
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('field', 'name type location')
    .sort({ date: -1 });
  res.json(reservations);
});

// GET /api/reservations – wszystkie rezerwacje (tylko admin)
const getAllReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate('user', 'name email')
    .populate('field', 'name type location')
    .sort({ date: -1 });
  res.json(reservations);
});


const getFieldAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Parametr date jest wymagany' });

  const reservations = await Reservation.find({
    field: req.params.fieldId,
    date: new Date(date),
    status: { $ne: 'cancelled' },
  }).select('startTime endTime');

  res.json(reservations);
});

// POST /api/reservations – tworzenie nowej rezerwacji
const createReservation = asyncHandler(async (req, res) => {
  const { fieldId, date, startTime, endTime } = req.body;

  // Walidacja kolejności czasu
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return res.status(400).json({ message: 'Godzina końca musi być późniejsza niż początku' });
  }

  const field = await Field.findById(fieldId);
  if (!field) return res.status(404).json({ message: 'Boisko nie zostało znalezione' });

  const reservationDate = new Date(date);

  // Zakaz rezerwacji w przeszłości
  if (reservationDate < new Date().setHours(0, 0, 0, 0)) {
    return res.status(400).json({ message: 'Nie można rezerwować w przeszłości' });
  }

  // Sprawdzenie konfliktów z istniejącymi rezerwacjami
  const existing = await Reservation.find({
    field: fieldId,
    date: reservationDate,
    status: { $ne: 'cancelled' },
  });

  if (hasTimeConflict(existing, startTime, endTime)) {
    return res.status(409).json({ message: 'Wybrany termin jest już zajęty' });
  }

  const reservation = await Reservation.create({
    user: req.user._id,
    field: fieldId,
    date: reservationDate,
    startTime,
    endTime,
  });

  await reservation.populate('field', 'name type location');
  res.status(201).json(reservation);
});

// przeniesienie rezerwacji (zmiana daty/godziny)
const updateReservation = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;

  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Rezerwacja nie została znaleziona' });

  // Tylko właściciel może przenieść rezerwację
  if (reservation.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Brak uprawnień do zmiany tej rezerwacji' });
  }

  if (reservation.status === 'cancelled') {
    return res.status(400).json({ message: 'Nie można przenieść anulowanej rezerwacji' });
  }

  // Walidacja kolejności czasu
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return res.status(400).json({ message: 'Godzina końca musi być późniejsza niż początku' });
  }

  const reservationDate = new Date(date);

  // Zakaz rezerwacji w przeszłości
  if (reservationDate < new Date().setHours(0, 0, 0, 0)) {
    return res.status(400).json({ message: 'Nie można rezerwować w przeszłości' });
  }

  // Sprawdzenie konfliktów – pomijamy aktualną rezerwację
  const existing = await Reservation.find({
    field: reservation.field,
    date: reservationDate,
    status: { $ne: 'cancelled' },
    _id: { $ne: reservation._id },
  });

  if (hasTimeConflict(existing, startTime, endTime)) {
    return res.status(409).json({ message: 'Wybrany termin jest już zajęty' });
  }

  reservation.date      = reservationDate;
  reservation.startTime = startTime;
  reservation.endTime   = endTime;
  await reservation.save();

  await reservation.populate('field', 'name type location');
  res.json(reservation);
});

// anulowanie rezerwacji
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Rezerwacja nie została znaleziona' });

  const isOwner = reservation.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Brak uprawnień do anulowania tej rezerwacji' });
  }

  if (reservation.status === 'cancelled') {
    return res.status(400).json({ message: 'Rezerwacja jest już anulowana' });
  }

  reservation.status = 'cancelled';
  await reservation.save();

  res.json({ message: 'Rezerwacja została anulowana', reservation });
});

module.exports = {
  getMyReservations,
  getAllReservations,
  getFieldAvailability,
  createReservation,
  updateReservation,
  cancelReservation,
};