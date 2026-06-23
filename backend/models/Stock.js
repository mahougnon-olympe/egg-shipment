const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  soldeDisponible: { type: Number, required: true, min: 0, default: 0 },
  seuilAlerte: { type: Number, default: 10 },
}, { timestamps: { createdAt: false, updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Stock', stockSchema);
