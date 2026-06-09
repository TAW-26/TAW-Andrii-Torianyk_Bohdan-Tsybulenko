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

router.get('/my', protect, getMyReservations);
router.get('/', protect, adminOnly, getAllReservations);
router.get('/availability/:fieldId', getFieldAvailability);
router.post('/', protect, createReservation);
router.patch('/:id/cancel', protect, cancelReservation);
router.patch('/:id', protect, updateReservation);

module.exports = router;