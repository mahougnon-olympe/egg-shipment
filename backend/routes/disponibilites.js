const router = require('express').Router();
const ctrl = require('../controllers/disponibiliteController');
const { auth, vendeurOnly } = require('../middleware/auth');

router.use(auth, vendeurOnly);
router.get('/', ctrl.get);
router.put('/', ctrl.update);

module.exports = router;
