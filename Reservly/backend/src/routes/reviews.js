const express = require('express');
const router = express.Router();
const { getFieldReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Opinie o boisku (publiczne)
router.get('/field/:fieldId', getFieldReviews);

// Dodawanie i usuwanie opinii (wymaga tokenu)
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;