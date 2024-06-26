const express = require('express');
const router = express.Router();
const pacientController = require('../controllers/pacient.controller');
const auth = require('../middleware/auth.middleware');

router.post('/create',auth.checkAuth, pacientController.create);

router.get('/',auth.checkAuth, pacientController.findAllbyAtrribute);

router.post('/pacient',auth.checkAuth, pacientController.findPacientById);

module.exports = router;