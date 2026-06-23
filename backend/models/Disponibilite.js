const mongoose = require('mongoose');

const disponibiliteSchema = new mongoose.Schema({
  vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  jours: {
    type: [String],
    enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
    default: [],
  },
  heureDebut: { type: String, default: '08:00' },
  heureFin: { type: String, default: '18:00' },
  adressePointVente: { type: String, default: '' },
  modesPaiement: { type: [String], default: [] },
});

module.exports = mongoose.model('Disponibilite', disponibiliteSchema);
