const express = require('express');
const router = express.Router();
const { getFieldReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/field/:fieldId', getFieldReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;