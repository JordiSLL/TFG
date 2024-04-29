const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth.middleware');

clientPath = path.join(__dirname, '..','client');

router.use(express.static(clientPath));

router.get('/', (req, res) => {
    res.sendFile(path.join(clientPath, 'loginRegister.html'));
  });

router.get('/main', auth.checkAuth, (req, res) => {
    res.sendFile(path.join(clientPath, 'main.html'));
});

router.post('/uploadVideo', (req, res) => {
  const { base64data, userId } = req.body;

  const userDir = path.join(__dirname, '..', 'uploads', 'user', userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const today = new Date();
  const fileName = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.mp4`;
  const filePath = path.join(userDir, fileName);

  const base64Buffer = Buffer.from(base64data.replace(/^data:video\/mp4;base64,/, ''), 'base64');
  
  fs.writeFile(filePath, base64Buffer, (err) => {
    if (err) {
      console.error('Error al guardar el vídeo:', err);
      res.status(500).json({ message: 'Error al guardar el vídeo' });
    } else {
      console.log('Vídeo guardado correctamente');
      res.json({ message: 'Vídeo guardado correctamente' });
    }
  });
});

module.exports = router;