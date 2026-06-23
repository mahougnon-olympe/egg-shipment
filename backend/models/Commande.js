const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientNom: { type: String, required: true },
  clientPrenom: { type: String, required: true },
  clientWhatsapp: { type: String, required: true },
  vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tarifId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tarif', required: true },
  tarifLabel: { type: String, required: true },
  prixUnitaire: { type: Number, required: true },
  nbPlateaux: { type: Number, required: true, min: 1 },
  montantTotal: { type: Number, required: true },
  modeReception: { type: String, enum: ['livraison', 'retrait'], required: true },
  lieuLivraison: { type: String, default: null },
  statut: {
    type: String,
    enum: ['nouvelle', 'confirmée', 'en_livraison', 'terminée', 'annulée'],
    default: 'nouvelle',
  },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Commande', commandeSchema);
