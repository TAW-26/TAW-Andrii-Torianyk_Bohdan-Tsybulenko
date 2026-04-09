const express = require('express');
const router = express.Router();
const { getMyReservations, getAllReservations, getFieldAvailability, createReservation, cancelReservation } = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/auth');

// Moje rezerwacje (zalogowany użytkownik)
router.get('/my', protect, getMyReservations);

// Wszystkie rezerwacje (tylko admin)
router.get('/', protect, adminOnly, getAllReservations);

// Dostępność boiska w danym dniu (publiczne)
router.get('/availability/:fieldId', getFieldAvailability);

// Tworzenie i anulowanie rezerwacji
router.post('/', protect, createReservation);
router.patch('/:id/cancel', protect, cancelReservation);

module.exports = router;