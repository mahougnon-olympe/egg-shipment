const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Disponibilite = require('../models/Disponibilite');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

exports.register = async (req, res) => {
  const { role, nom, prenom, whatsapp, email, password } = req.body;

  if (role === 'vendeur') {
    const vendeurExiste = await User.findOne({ role: 'vendeur' });
    if (vendeurExiste) return res.status(409).json({ message: 'Un compte vendeur existe déjà' });
  }

  const exists = await User.findOne({ whatsapp });
  if (exists) return res.status(409).json({ message: 'Ce numéro WhatsApp est déjà utilisé' });

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ role, nom, prenom, whatsapp, email, password_hash });

  if (role === 'vendeur') {
    await Stock.create({ vendeurId: user._id, soldeDisponible: 0, seuilAlerte: 10 });
    await Disponibilite.create({ vendeurId: user._id });
  }

  const token = signToken(user._id);
  res.status(201).json({ token, user: { id: user._id, role, nom, prenom, whatsapp, email } });
};

exports.login = async (req, res) => {
  const { whatsapp, email, password } = req.body;

  const query = whatsapp ? { whatsapp } : { email };
  const user = await User.findOne(query);
  if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Identifiants incorrects' });

  const token = signToken(user._id);
  res.json({
    token,
    user: { id: user._id, role: user.role, nom: user.nom, prenom: user.prenom, whatsapp: user.whatsapp, email: user.email },
  });
};

exports.me = (req, res) => {
  const u = req.user;
  res.json({ id: u._id, role: u.role, nom: u.nom, prenom: u.prenom, whatsapp: u.whatsapp, email: u.email });
};

exports.updateMe = async (req, res) => {
  const { nom, prenom, whatsapp, email, password } = req.body;
  const updates = {};
  if (nom) updates.nom = nom;
  if (prenom) updates.prenom = prenom;
  if (whatsapp) updates.whatsapp = whatsapp;
  if (email !== undefined) updates.email = email;
  if (password) updates.password_hash = await bcrypt.hash(password, 12);

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password_hash');
  res.json({ id: user._id, role: user.role, nom: user.nom, prenom: user.prenom, whatsapp: user.whatsapp, email: user.email });
};

exports.updateFcmToken = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.fcmToken });
  res.json({ message: 'Token FCM mis à jour' });
};
