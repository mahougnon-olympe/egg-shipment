const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['client', 'vendeur', 'fournisseur'], required: true },
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  whatsapp: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true, sparse: true },
  password_hash: { type: String, required: true },
  fcmToken: { type: String },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('User', userSchema);
