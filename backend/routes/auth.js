const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register', [
  body('role').isIn(['client', 'vendeur']),
  body('nom').notEmpty(),
  body('prenom').notEmpty(),
  body('whatsapp').matches(/^\+?[0-9]{8,15}$/),
  body('password').isLength({ min: 6 }),
], validate, ctrl.register);

router.post('/login', [
  body('password').notEmpty(),
], validate, ctrl.login);

router.get('/me', auth, ctrl.me);
router.put('/me', auth, ctrl.updateMe);
router.put('/fcm-token', auth, [body('fcmToken').notEmpty()], validate, ctrl.updateFcmToken);

module.exports = router;
