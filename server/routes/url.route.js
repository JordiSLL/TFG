const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');
clientPath = path.join(__dirname, '..','client');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

//const upload = multer();
router.use(express.static(clientPath));
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
router.get('/', (req, res) => {
    res.sendFile(path.join(clientPath, 'loginRegister.html'));
  });

router.get('/main', auth.checkAuth, (req, res) => {
    res.sendFile(path.join(clientPath, 'main.html'));
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const userId = req.body.userId;
      const userDir = path.join(__dirname, '..', 'uploads', 'user', userId);
      if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
      }
      cb(null, userDir);
  },
  filename: function (req, file, cb) {
      cb(null, 'video.webm');
  }
});
const upload = multer({ storage: storage }).single('video');

router.post('/uploadVideo', (req, res) => {
  upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
          console.error('Error al subir el archivo:', err);
          return res.status(500).json({ message: 'Error al subir el archivo' });
      } else if (err) {
          console.error('Error al subir el archivo:', err);
          return res.status(500).json({ message: 'Error al subir el archivo' });
      }

      const userId = req.body.userId;
      console.log("HELLOO: " + userId);
      if (!userId) {
          return res.status(400).json({ message: 'Missing userId' });
      }

      const userDir = path.join(__dirname, '..', 'uploads', 'user', userId);
      const today = new Date();
      const fileName = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.mp4`;
      const inputFilePath = path.join(userDir, 'video.webm');
      const outputFilePath = path.join(userDir, fileName);

      // Convertir el archivo de WebM a MP4 usando ffmpeg
      ffmpeg(inputFilePath)
          .outputOptions('-c:v libx264')
          .outputOptions('-preset slow')
          .outputOptions('-crf 22')
          .outputOptions('-c:a aac')
          .outputOptions('-b:a 128k')
          .on('end', () => {
              console.log('Archivo convertido correctamente a MP4');
              res.json({ message: 'Vídeo subido y convertido correctamente a MP4' });
          })
          .on('error', (err) => {
              console.error('Error al convertir el archivo a MP4:', err);
              res.status(500).json({ message: 'Error al convertir el archivo a MP4' });
          })
          .save(outputFilePath);
  });
});
module.exports = router;