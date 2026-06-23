const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/commandeController');
const { auth, vendeurOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth);

router.post('/', [
  body('tarifId').notEmpty(),
  body('nbPlateaux').isInt({ min: 1 }),
  body('modeReception').isIn(['livraison', 'retrait']),
], validate, ctrl.create);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

router.patch('/:id/statut', vendeurOnly, [
  body('statut').isIn(['nouvelle', 'confirmée', 'en_livraison', 'terminée', 'annulée']),
], validate, ctrl.updateStatut);

router.patch('/:id/confirmer', ctrl.confirmerReception);

router.post('/:id/avis', [
  body('note').isInt({ min: 1, max: 5 }),
], validate, ctrl.soumettreAvis);

module.exports = router;
