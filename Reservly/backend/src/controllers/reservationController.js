const Reservation = require('../models/Reservation');
const Field = require('../models/Field');

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

// Pobranie rezerwacji zalogowanego użytkownika
const getMyReservations = async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('field', 'name type location')
    .sort({ date: -1 });
  res.json(reservations);
};

// Pobranie wszystkich rezerwacji (tylko admin)
const getAllReservations = async (req, res) => {
  const reservations = await Reservation.find()
    .populate('user', 'name email')
    .populate('field', 'name type location')
    .sort({ date: -1 });
  res.json(reservations);
};

// Sprawdzenie dostępności boiska w danym dniu
const getFieldAvailability = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Parametr date jest wymagany' });

  const reservations = await Reservation.find({
    field: req.params.fieldId,
    date: new Date(date),
    status: { $ne: 'cancelled' },
  }).select('startTime endTime');

  res.json(reservations);
};

// Tworzenie nowej rezerwacji
const createReservation = async (req, res) => {
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
};

// Anulowanie rezerwacji (właściciel lub admin)
const cancelReservation = async (req, res) => {
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
};

module.exports = {
  getMyReservations,
  getAllReservations,
  getFieldAvailability,
  createReservation,
  cancelReservation,
};