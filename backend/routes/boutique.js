const router = require('express').Router();
const ctrl = require('../controllers/boutiqueController');

router.get('/', ctrl.getBoutique);

module.exports = router;
