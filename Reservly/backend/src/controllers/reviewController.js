const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../middleware/asyncHandler');

// opinie o danym boisku
const getFieldReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ field: req.params.fieldId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// Pdodanie opinii
const createReview = asyncHandler(async (req, res) => {
  const { fieldId, rating, comment } = req.body;

  // Sprawdzenie czy użytkownik faktycznie rezerwował to boisko
  const hasReservation = await Reservation.findOne({
    user: req.user._id,
    field: fieldId,
    status: 'confirmed',
  });

  if (!hasReservation) {
    return res.status(403).json({ message: 'Możesz oceniać tylko boiska, które zarezerwowałeś' });
  }

  // Sprawdzenie czy opinia już istnieje
  const existing = await Review.findOne({ user: req.user._id, field: fieldId });
  if (existing) return res.status(409).json({ message: 'Już dodałeś opinię o tym boisku' });

  const review = await Review.create({ user: req.user._id, field: fieldId, rating, comment });
  await review.populate('user', 'name');
  res.status(201).json(review);
});

// usunięcie opinii
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Opinia nie została znaleziona' });

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Brak uprawnień do usunięcia tej opinii' });
  }

  await review.deleteOne();
  res.json({ message: 'Opinia została usunięta' });
});

module.exports = { getFieldReviews, createReview, deleteReview };