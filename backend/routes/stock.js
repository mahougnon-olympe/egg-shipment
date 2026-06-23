const router = require('express').Router();
const ctrl = require('../controllers/stockController');
const { auth, vendeurOnly } = require('../middleware/auth');

router.use(auth, vendeurOnly);
router.get('/', ctrl.getStock);
router.put('/', ctrl.updateStock);

module.exports = router;
