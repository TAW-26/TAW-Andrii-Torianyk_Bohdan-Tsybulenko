const Field = require('../models/Field');

// Pobranie wszystkich boisk (opcjonalne filtrowanie)
const getAllFields = async (req, res) => {
  const { type, location } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (location) filter.location = new RegExp(location, 'i');

  const fields = await Field.find(filter).sort({ name: 1 });
  res.json(fields);
};

// Pobranie jednego boiska po ID
const getFieldById = async (req, res) => {
  const field = await Field.findById(req.params.id);
  if (!field) return res.status(404).json({ message: 'Boisko nie zostało znalezione' });
  res.json(field);
};

// Dodanie nowego boiska (tylko admin)
const createField = async (req, res) => {
  const field = await Field.create(req.body);
  res.status(201).json(field);
};

// Aktualizacja boiska (tylko admin)
const updateField = async (req, res) => {
  const field = await Field.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!field) return res.status(404).json({ message: 'Boisko nie zostało znalezione' });
  res.json(field);
};

// Usunięcie boiska (tylko admin)
const deleteField = async (req, res) => {
  const field = await Field.findByIdAndDelete(req.params.id);
  if (!field) return res.status(404).json({ message: 'Boisko nie zostało znalezione' });
  res.json({ message: 'Boisko zostało usunięte' });
};

module.exports = { getAllFields, getFieldById, createField, updateField, deleteField };