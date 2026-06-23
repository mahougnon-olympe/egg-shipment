const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/tarifController');
const { auth, vendeurOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth, vendeurOnly);

router.get('/', ctrl.list);
router.post('/', [body('prixUnitaire').isFloat({ min: 0 }), body('label').notEmpty()], validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/toggle', ctrl.toggle);

module.exports = router;
