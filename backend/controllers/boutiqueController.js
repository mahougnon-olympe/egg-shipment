const Tarif = require('../models/Tarif');
const Stock = require('../models/Stock');
const Disponibilite = require('../models/Disponibilite');
const User = require('../models/User');

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function estOuvert(dispo) {
  if (!dispo) return false;
  const now = new Date();
  const jourActuel = JOURS[now.getDay()];
  if (!dispo.jours.includes(jourActuel)) return false;
  const [hd, md] = dispo.heureDebut.split(':').map(Number);
  const [hf, mf] = dispo.heureFin.split(':').map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= hd * 60 + md && minutesNow <= hf * 60 + mf;
}

exports.getBoutique = async (_req, res) => {
  const vendeur = await User.findOne({ role: 'vendeur' }).select('nom prenom whatsapp');
  if (!vendeur) return res.status(404).json({ message: 'Boutique non configurée' });

  const [tarifs, stock, dispo] = await Promise.all([
    Tarif.find({ vendeurId: vendeur._id, actif: true }),
    Stock.findOne({ vendeurId: vendeur._id }),
    Disponibilite.findOne({ vendeurId: vendeur._id }),
  ]);

  res.json({
    vendeur: { id: vendeur._id, nom: vendeur.nom, prenom: vendeur.prenom, whatsapp: vendeur.whatsapp },
    ouvert: estOuvert(dispo),
    tarifs,
    stock: stock ? { soldeDisponible: stock.soldeDisponible } : { soldeDisponible: 0 },
    disponibilites: dispo,
  });
};
