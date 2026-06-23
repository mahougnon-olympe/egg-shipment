const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password_hash');
    if (!req.user) return res.status(401).json({ message: 'Utilisateur introuvable' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

const vendeurOnly = (req, res, next) => {
  if (req.user?.role !== 'vendeur') {
    return res.status(403).json({ message: 'Accès réservé au vendeur' });
  }
  next();
};

const fournisseurOnly = (req, res, next) => {
  if (req.user?.role !== 'fournisseur') {
    return res.status(403).json({ message: 'Accès réservé au fournisseur' });
  }
  next();
};

module.exports = { auth, vendeurOnly, fournisseurOnly };
