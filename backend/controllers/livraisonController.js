const Livraison = require('../models/Livraison');
const StockFournisseur = require('../models/StockFournisseur');
const Stock = require('../models/Stock');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  const [sf, livraisons] = await Promise.all([
    StockFournisseur.findOne({ fournisseurId: req.user._id }),
    Livraison.find({ fournisseurId: req.user._id }),
  ]);
  const totalLivre = livraisons.reduce((s, l) => s + l.quantite, 0);
  const valeurLivree = livraisons.reduce((s, l) => s + l.montantTotal, 0);
  res.json({
    soldeDisponible: sf?.soldeDisponible ?? 0,
    totalLivre,
    valeurLivree,
  });
};

exports.approvisionner = async (req, res) => {
  const { quantite } = req.body;
  const sf = await StockFournisseur.findOneAndUpdate(
    { fournisseurId: req.user._id },
    { $inc: { soldeDisponible: quantite } },
    { new: true, upsert: true }
  );
  res.json(sf);
};

exports.list = async (req, res) => {
  const livraisons = await Livraison.find({ fournisseurId: req.user._id }).sort({ createdAt: -1 });
  res.json(livraisons);
};

exports.create = async (req, res) => {
  const { quantite, prixUnitaire, note } = req.body;

  const sf = await StockFournisseur.findOne({ fournisseurId: req.user._id });
  if (!sf || sf.soldeDisponible < quantite) {
    return res.status(400).json({ message: `Stock insuffisant — ${sf?.soldeDisponible ?? 0} plateau(x) disponible(s)` });
  }

  const montantTotal = quantite * prixUnitaire;
  const livraison = await Livraison.create({
    fournisseurId: req.user._id,
    fournisseurNom: `${req.user.prenom} ${req.user.nom}`,
    quantite,
    prixUnitaire,
    montantTotal,
    note: note || '',
  });

  await StockFournisseur.findOneAndUpdate(
    { fournisseurId: req.user._id },
    { $inc: { soldeDisponible: -quantite } }
  );

  const vendeur = await User.findOne({ role: 'vendeur' });
  if (vendeur) {
    await Stock.findOneAndUpdate(
      { vendeurId: vendeur._id },
      { $inc: { soldeDisponible: quantite } },
      { upsert: true }
    );
    req.io.emit('maj_boutique', { type: 'stock_maj' });
  }

  req.io.emit('nouvelle_livraison', livraison);
  res.status(201).json(livraison);
};
