const Commande = require('../models/Commande');
const Tarif = require('../models/Tarif');
const Stock = require('../models/Stock');
const User = require('../models/User');
const { envoyerNotifVendeur } = require('../services/fcm');

exports.create = async (req, res) => {
  const { tarifId, nbPlateaux, modeReception, lieuLivraison, modePaiement } = req.body;

  const tarif = await Tarif.findOne({ _id: tarifId, actif: true });
  if (!tarif) return res.status(400).json({ message: 'Tarif invalide ou inactif' });

  if (tarif.stockDisponible < nbPlateaux) {
    return res.status(400).json({ message: `Stock insuffisant pour ce tarif, ${tarif.stockDisponible} plateau(x) restant(s)` });
  }

  const vendeur = await User.findById(tarif.vendeurId);
  if (!vendeur) return res.status(400).json({ message: 'Vendeur introuvable' });

  if (modeReception === 'livraison' && !lieuLivraison) {
    return res.status(400).json({ message: 'Lieu de livraison requis' });
  }

  const montantTotal = nbPlateaux * tarif.prixUnitaire;
  const client = req.user;

  const commande = await Commande.create({
    clientId: client._id,
    clientNom: client.nom,
    clientPrenom: client.prenom,
    clientWhatsapp: client.whatsapp,
    vendeurId: vendeur._id,
    tarifId: tarif._id,
    tarifLabel: tarif.label,
    prixUnitaire: tarif.prixUnitaire,
    nbPlateaux,
    montantTotal,
    modeReception,
    lieuLivraison: modeReception === 'livraison' ? lieuLivraison : null,
    modePaiement: modePaiement || '',
  });

  req.io.emit('nouvelle_commande', commande);

  if (vendeur.fcmToken) {
    envoyerNotifVendeur(vendeur.fcmToken, commande).catch(console.error);
  }

  res.status(201).json(commande);
};

exports.list = async (req, res) => {
  const filter = req.user.role === 'vendeur'
    ? { vendeurId: req.user._id }
    : { clientId: req.user._id };
  const commandes = await Commande.find(filter).sort({ createdAt: -1 });
  res.json(commandes);
};

exports.getOne = async (req, res) => {
  const filter = req.user.role === 'vendeur'
    ? { _id: req.params.id, vendeurId: req.user._id }
    : { _id: req.params.id, clientId: req.user._id };
  const commande = await Commande.findOne(filter);
  if (!commande) return res.status(404).json({ message: 'Commande introuvable' });
  res.json(commande);
};

exports.updateStatut = async (req, res) => {
  const { statut } = req.body;
  const commande = await Commande.findOneAndUpdate(
    { _id: req.params.id, vendeurId: req.user._id },
    { statut },
    { new: true }
  );
  if (!commande) return res.status(404).json({ message: 'Commande introuvable' });

  if (statut === 'confirmée') {
    await Promise.all([
      Stock.findOneAndUpdate(
        { vendeurId: req.user._id },
        { $inc: { soldeDisponible: -commande.nbPlateaux } }
      ),
      Tarif.findByIdAndUpdate(commande.tarifId, { $inc: { stockDisponible: -commande.nbPlateaux } }),
    ]);
    req.io.emit('maj_boutique', { type: 'stock_maj' });
  }

  req.io.emit('statut_commande', { commandeId: commande._id, statut });

  const client = await User.findById(commande.clientId);
  if (client?.fcmToken) {
    const { envoyerNotifClient } = require('../services/fcm');
    envoyerNotifClient(client.fcmToken, commande, statut).catch(console.error);
  }

  res.json(commande);
};

exports.confirmerReception = async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ message: 'Réservé au client' });

  const commande = await Commande.findOneAndUpdate(
    { _id: req.params.id, clientId: req.user._id, statut: 'terminée', receptionConfirmee: false },
    { receptionConfirmee: true },
    { new: true }
  );
  if (!commande) return res.status(404).json({ message: 'Commande introuvable ou déjà confirmée' });

  req.io.emit('reception_confirmee', { commandeId: commande._id });
  res.json(commande);
};

exports.soumettreAvis = async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ message: 'Réservé au client' });

  const { note, commentaire } = req.body;
  const commande = await Commande.findOne({ _id: req.params.id, clientId: req.user._id, receptionConfirmee: true });
  if (!commande) return res.status(404).json({ message: 'Commande introuvable ou réception non confirmée' });
  if (commande.avis?.note) return res.status(409).json({ message: 'Avis déjà soumis' });

  commande.avis = { note, commentaire: commentaire || '', date: new Date() };
  await commande.save();

  req.io.emit('avis_commande', { commandeId: commande._id, avis: commande.avis });
  res.json(commande);
};
