const path = require('path');
const multer = require('multer');
const model = require('../models/url.model');
const mongoDBUser = new model.MongoDBUser();

const clientPath = path.join(__dirname, '..', 'client');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = path.join(__dirname, '..', 'uploads', 'user', userId);
    model.createDirectory(userDir, (err, userDir) => {
      if (err) {
        return cb(err);
      }
      cb(null, userDir);
    });
  },
  filename: function (req, file, cb) {
    cb(null, 'video.webm');
  }
});

const upload = multer({ storage: storage }).single('video');

const renderLoginRegister = (req, res) => {
  res.sendFile(path.join(clientPath, 'loginRegister.html'));
};

const renderMain = (req, res) => {
  res.sendFile(path.join(clientPath, 'main.html'));
};

const uploadVideo = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ message: 'Error al subir el archivo' });
    } else if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ message: 'Error al subir el archivo' });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    model.convertVideo(userId, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al convertir el archivo a MP4' });
      }
      res.json({ message: 'Vídeo subido y convertido correctamente a MP4' });
    });
  });
};

const createSession = async(req, res) =>{
    const session = req.body;
    console.log(session)

    if (!session.userId) {
      return res.status(400).send({ message: "Error al crear la sessio"});
    }
    session.date = model.generateUniqueId();
    console.log(session)
    try {
        const sessionId = await mongoDBUser.create(session);
        const sessionDir = path.join(__dirname, '..', 'uploads', 'user', session.userId, session.date,"videos");
        model.createDirectory(sessionDir, (err, userDir) => {
            if (err) {
                console.error("Error al crear la carpeta de la nova sessio", err);
                return res.status(500).send({ message: "Error al crear la carpeta de la nova sessio" });
            }
            res.status(200).send({ message: "Sessio creada correctament", userId: session.userId });
        });
      } catch (error) {
        console.log("Error en la creació", error);
        res.status(500).send({ message: "Error al crear la sessió" });
      }
};

module.exports = {
  renderLoginRegister,
  renderMain,
  uploadVideo,
  createSession
};
