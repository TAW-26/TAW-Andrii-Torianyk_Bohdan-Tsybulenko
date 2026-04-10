const express = require('express');
const router = express.Router();
const {
  getMyReservations,
  getAllReservations,
  getFieldAvailability,
  createReservation,
  updateReservation,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/auth');

// Moje rezerwacje (zalogowany użytkownik)
router.get('/my', protect, getMyReservations);

// Wszystkie rezerwacje (tylko admin)
router.get('/', protect, adminOnly, getAllReservations);

// Dostępność boiska w danym dniu (publiczne)
router.get('/availability/:fieldId', getFieldAvailability);

// Tworzenie rezerwacji
router.post('/', protect, createReservation);

// Przeniesienie rezerwacji na inny termin (tylko właściciel)
router.patch('/:id', protect, updateReservation);

// Anulowanie rezerwacji (właściciel lub admin)
router.patch('/:id/cancel', protect, cancelReservation);
module.exports = router;