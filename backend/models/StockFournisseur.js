const mongoose = require('mongoose');

const stockFournisseurSchema = new mongoose.Schema({
  fournisseurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  soldeDisponible: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: { createdAt: false, updatedAt: 'updatedAt' } });

module.exports = mongoose.model('StockFournisseur', stockFournisseurSchema);
