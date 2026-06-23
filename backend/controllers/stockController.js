const Stock = require('../models/Stock');

exports.getStock = async (req, res) => {
  const stock = await Stock.findOne({ vendeurId: req.user._id });
  res.json(stock || { soldeDisponible: 0, seuilAlerte: 10 });
};

exports.updateStock = async (req, res) => {
  const { soldeDisponible, seuilAlerte } = req.body;
  const updates = {};
  if (soldeDisponible !== undefined) updates.soldeDisponible = soldeDisponible;
  if (seuilAlerte !== undefined) updates.seuilAlerte = seuilAlerte;

  const stock = await Stock.findOneAndUpdate(
    { vendeurId: req.user._id },
    updates,
    { new: true, upsert: true }
  );
  req.io.emit('maj_boutique', { type: 'stock_maj', stock: { soldeDisponible: stock.soldeDisponible } });
  res.json(stock);
};
