const Disponibilite = require('../models/Disponibilite');

exports.get = async (req, res) => {
  const dispo = await Disponibilite.findOne({ vendeurId: req.user._id });
  res.json(dispo || {});
};

exports.update = async (req, res) => {
  const { jours, heureDebut, heureFin, adressePointVente } = req.body;
  const dispo = await Disponibilite.findOneAndUpdate(
    { vendeurId: req.user._id },
    { jours, heureDebut, heureFin, adressePointVente },
    { new: true, upsert: true }
  );
  req.io.emit('maj_boutique', { type: 'dispo_maj', dispo });
  res.json(dispo);
};
