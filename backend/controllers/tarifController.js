const Tarif = require('../models/Tarif');

exports.list = async (req, res) => {
  const tarifs = await Tarif.find({ vendeurId: req.user._id }).sort({ createdAt: -1 });
  res.json(tarifs);
};

exports.create = async (req, res) => {
  const { prixUnitaire, label } = req.body;
  const tarif = await Tarif.create({ vendeurId: req.user._id, prixUnitaire, label });
  req.io.emit('maj_boutique', { type: 'tarif_ajout', tarif });
  res.status(201).json(tarif);
};

exports.update = async (req, res) => {
  const tarif = await Tarif.findOneAndUpdate(
    { _id: req.params.id, vendeurId: req.user._id },
    req.body,
    { new: true }
  );
  if (!tarif) return res.status(404).json({ message: 'Tarif introuvable' });
  req.io.emit('maj_boutique', { type: 'tarif_maj', tarif });
  res.json(tarif);
};

exports.remove = async (req, res) => {
  const tarif = await Tarif.findOneAndDelete({ _id: req.params.id, vendeurId: req.user._id });
  if (!tarif) return res.status(404).json({ message: 'Tarif introuvable' });
  req.io.emit('maj_boutique', { type: 'tarif_supprime', tarifId: req.params.id });
  res.json({ message: 'Tarif supprimé' });
};

exports.toggle = async (req, res) => {
  const tarif = await Tarif.findOne({ _id: req.params.id, vendeurId: req.user._id });
  if (!tarif) return res.status(404).json({ message: 'Tarif introuvable' });
  tarif.actif = !tarif.actif;
  await tarif.save();
  req.io.emit('maj_boutique', { type: 'tarif_toggle', tarif });
  res.json(tarif);
};
