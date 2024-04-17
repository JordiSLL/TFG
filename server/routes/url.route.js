const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth.middleware');

clientPath = path.join(__dirname, '..','client');

router.use(express.static(clientPath));

router.get('/', (req, res) => {
    res.sendFile(path.join(clientPath, 'loginRegister.html'));
  });

router.get('/main', auth.checkAuth, (req, res) => {
    res.sendFile(path.join(clientPath, 'main.html'));
});
module.exports = router;