const path = require('path');
const multer = require('multer');
const model = require('../models/url.model');
const mongoDBUser = new model.MongoDBUser();
const fs = require('fs');

const clientPath = path.join(__dirname, '..', 'client');

const renderLoginRegister = (req, res) => {
    res.sendFile(path.join(clientPath, 'loginRegister.html'));
  };
  
  const renderMain = (req, res) => {
    res.sendFile(path.join(clientPath, 'main.html'));
  };

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      model.createDirectory(req.body.userId, (err, userDir) => {
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

const uploadVideo = (req, res) => {
  upload(req, res, (err) => {
    console.log(req.body.userId)
    console.log(req.file)
    if (err instanceof multer.MulterError) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ message: 'Error al subir el archivo' });
    } else if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ message: 'Error al subir el archivo' });
    }

    const userId = req.body.userId;
    const currentSession = req.body.currentSession;
    const currentVideo = model.generateUniqueId();

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }
    const videoDir = path.join(__dirname, '..', 'uploads', 'user', userId,"session", currentSession,"videos",currentVideo);
    createDirectory(videoDir);
    const filePath = path.join(videoDir,"video.webm");
    
    const tempPath = req.file.path;
    fs.rename(tempPath, filePath, (err) => {
      if (err) {
        console.error('Error al mover el archivo:', err);
        return res.status(500).json({ message: 'Error al guardar el archivo' });
      }
      res.json({ message: 'Vídeo subido correctamente' });
    });

/*
    model.convertVideo(userId, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al convertir el archivo a MP4' });
      }
      res.json({ message: 'Vídeo subido y convertido correctamente a MP4' });
    });*/
  });
};

const createSession = async(req, res) =>{
    const session = req.body;
    console.log(session)

    if (!session.userId) {
      return res.status(400).send({ message: "Error al crear la sessio"});
    }
    if (!session.date) session.date = model.generateUniqueId();
    session.videos = [];
    console.log(session)
    try {
        const sessionId = await mongoDBUser.create(session);
        const sessionDir = path.join(__dirname, '..', 'uploads', 'user', session.userId,"session", session.date,"videos");
        createDirectory(sessionDir);
        res.status(200).send({ message: "Sessio creada correctament", sessionDate: session.date });
      } catch (error) {
        console.log("Error en la creació", error);
        res.status(500).send({ message: "Error al crear la sessió" });
      }
};

function createDirectory (directory){
    model.createDirectory(directory, (err, userDir) => {
        if (err) {
            console.error("Error al crear el directori", err);
            return res.status(500).send({ message: "Error al crear el directori" });
        }
    });
}

module.exports = {
  renderLoginRegister,
  renderMain,
  uploadVideo,
  createSession
};