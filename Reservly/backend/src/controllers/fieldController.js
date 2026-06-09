const Field = require('../models/Field');
const asyncHandler = require('../middleware/asyncHandler');
 
const getAllFields = asyncHandler(async (req, res) => {
  const { type, location } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (location) filter.location = new RegExp(location, 'i');

  const fields = await Field.find(filter).sort({ name: 1 });
  res.json(fields);
});

const getFieldById = asyncHandler(async (req, res) => {
  const field = await Field.findById(req.params.id);
  if (!field) return res.status(404).json({ message: 'Boisko nie zostało znalezione' });
  res.json(field);
});

const createField = asyncHandler(async (req, res) => {
  const field = await Field.create(req.body);
  res.status(201).json(field);
});

const updateField = asyncHandler(async (req, res) => {
  const field = await Field.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!field) return res.status(404).json({ message: 'Boisko nie zostało znalezione' });
  res.json(field);
});

const deleteField = asyncHandler(async (req, res) => {
  const field = await Field.findByIdAndDelete(req.params.id);
  if (!field) return res.status(404).json({ message: 'Boisko nie zostało znalezione' });
  res.json({ message: 'Boisko zostało usunięte' });
});

module.exports = { getAllFields, getFieldById, createField, updateField, deleteField };