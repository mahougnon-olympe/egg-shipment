const mongoose = require('mongoose');

const livraisonSchema = new mongoose.Schema({
  fournisseurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fournisseurNom: { type: String, required: true },
  quantite: { type: Number, required: true, min: 1 },
  prixUnitaire: { type: Number, required: true, min: 0 },
  montantTotal: { type: Number, required: true },
  note: { type: String, default: '' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('Livraison', livraisonSchema);
