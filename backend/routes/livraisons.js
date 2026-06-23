const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/livraisonController');
const { auth, fournisseurOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth, fournisseurOnly);
router.get('/stats', ctrl.getStats);
router.post('/approvisionner', [body('quantite').isInt({ min: 1 })], validate, ctrl.approvisionner);
router.get('/', ctrl.list);
router.post('/', [
  body('quantite').isInt({ min: 1 }),
  body('prixUnitaire').isFloat({ min: 0 }),
], validate, ctrl.create);

module.exports = router;
