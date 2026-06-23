const Commande = require('../models/Commande');
const Tarif = require('../models/Tarif');
const Stock = require('../models/Stock');
const User = require('../models/User');
const { envoyerNotifVendeur } = require('../services/fcm');

exports.create = async (req, res) => {
  const { tarifId, nbPlateaux, modeReception, lieuLivraison } = req.body;

  const tarif = await Tarif.findOne({ _id: tarifId, actif: true });
  if (!tarif) return res.status(400).json({ message: 'Tarif invalide ou inactif' });

  const vendeur = await User.findById(tarif.vendeurId);
  if (!vendeur) return res.status(400).json({ message: 'Vendeur introuvable' });

  const stock = await Stock.findOne({ vendeurId: vendeur._id });
  if (!stock || stock.soldeDisponible < nbPlateaux) {
    return res.status(400).json({ message: `Stock insuffisant, ${stock?.soldeDisponible ?? 0} plateaux restants` });
  }

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
  });

  req.io.emit('nouvelle_commande', commande);

  // Notification push vendeur
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

  // Décrémente le stock quand la commande passe à "confirmée"
  if (statut === 'confirmée') {
    await Stock.findOneAndUpdate(
      { vendeurId: req.user._id },
      { $inc: { soldeDisponible: -commande.nbPlateaux } }
    );
    req.io.emit('maj_boutique', { type: 'stock_maj' });
  }

  req.io.emit('statut_commande', { commandeId: commande._id, statut });

  // Notification push client
  const client = await User.findById(commande.clientId);
  if (client?.fcmToken) {
    const { envoyerNotifClient } = require('../services/fcm');
    envoyerNotifClient(client.fcmToken, commande, statut).catch(console.error);
  }

  res.json(commande);
};
