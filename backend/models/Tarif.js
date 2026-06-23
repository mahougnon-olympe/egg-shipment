const mongoose = require('mongoose');

const tarifSchema = new mongoose.Schema({
  vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prixUnitaire: { type: Number, required: true, min: 0 },
  label: { type: String, required: true, trim: true },
  actif: { type: Boolean, default: true },
  stockDisponible: { type: Number, default: 0, min: 0 },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('Tarif', tarifSchema);
