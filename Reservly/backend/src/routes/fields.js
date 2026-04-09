const express = require('express');
const router = express.Router();
const { getAllFields, getFieldById, createField, updateField, deleteField } = require('../controllers/fieldController');
const { protect, adminOnly } = require('../middleware/auth');

// Przeglądanie boisk (publiczne)
router.get('/', getAllFields);
router.get('/:id', getFieldById);

// Zarządzanie boiskami (tylko admin)
router.post('/', protect, adminOnly, createField);
router.put('/:id', protect, adminOnly, updateField);
router.delete('/:id', protect, adminOnly, deleteField);

module.exports = router;