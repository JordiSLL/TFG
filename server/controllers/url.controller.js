const path = require('path');
const multer = require('multer');
const model = require('../models/url.model');
const mongoDBUser = new model.MongoDBUser();
const fs = require('fs');

const clientPath = path.join(__dirname, '..', 'client');

exports.renderLoginRegister = (req, res) => {
    res.sendFile(path.join(clientPath, 'loginRegister.html'));
};

exports.renderMain = (req, res) => {
    res.sendFile(path.join(clientPath, 'main.html'));
};

exports.renderDocumentation = (req, res) => {
    res.sendFile(path.join(clientPath, 'documentation.html'));
};

exports.renderSessionDashboard = (req, res) => {
    console.log(req.params.sessionId)
    res.sendFile(path.join(clientPath, 'sessionDashboard.html'));
};

exports.renderUserDashboard = (req, res) => {
    res.sendFile(path.join(clientPath, 'userDashboard.html'));
};

exports.renderVideoDashboard = (req, res) => {
    res.sendFile(path.join(clientPath, 'videoDashboard.html'));
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        model.createDirectory(path.join(__dirname, '..', 'uploads', 'tmp', req.body.userId), (err, userDir) => {
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

exports.uploadVideo = (req, res) => {
    upload(req, res, async (err) => {
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
        const currentSession = req.body.SessionDate;
        const currentVideo = model.generateUniqueId();
        const video = {
            path: currentVideo
        };

        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }
        const updateSuccess = await mongoDBUser.addVideoToSession(userId, currentSession, video);

        const videoDir = path.join(__dirname, '..', 'uploads', 'user', userId, "session", currentSession, "videos", currentVideo);

        createDirectory(videoDir);
        const filePath = path.join(videoDir, "video.webm");

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

exports.createSession = async (req, res) => {
    const session = req.body;
    console.log(session)
    if (!session.userId) {
        return res.status(400).send({ message: "Error al crear la sessio" });
    }
    if (!session.date) session.date = model.generateUniqueId();
    session.videos = [];
    session.IdEstado = 1;
    //session.emociones = [Prosody, Language, Face]
    console.log(session)
    try {
        const sessionId = await mongoDBUser.create(session);
        const sessionDir = path.join(__dirname, '..', 'uploads', 'user', session.userId, "session", session.date, "videos");
        createDirectory(sessionDir);
        res.status(200).send({ message: "Sessio creada correctament", sessionDate: session.date, sessionId: sessionId });
    } catch (error) {
        console.log("Error en la creació", error);
        res.status(500).send({ message: "Error al crear la sessió" });
    }
};

function createDirectory(directory) {
    model.createDirectory(directory, (err, userDir) => {
        if (err) {
            console.error("Error al crear el directori", err);
            return res.status(500).send({ message: "Error al crear el directori" });
        }
    });
}

exports.getSessionsByUserID = async(req, res) =>{
    const user = req.body;
    console.log(user)
    if (!user.userId) {
        return res.status(400).send({ message: "Error al trobar les sessions de l'usuari" });
    }
    try {
        const sessions = await mongoDBUser.findSessionsByUserId(user.userId);
        res.status(200).send({ message: "Sense error al busscar les sessions del usuari", sessions: sessions});
    } catch (error) {
        console.log("Error al trobar les sessions del usuari", error);
        res.status(500).send({ message: "Error al trobar les sessions del usuari" });
    }
}

exports.getSessionByID = async(req, res) =>{
    const sessionId = req.body;
    if (!sessionId.sessionId) {
        return res.status(400).send({ message: "Error al trobar la sessió de l'usuari" });
    }
    try {
        const session = await mongoDBUser.findSessionById(sessionId.sessionId);
        console.log(session)
        res.status(200).send({ message: "Sense error al busscar la sessió del usuari", session: session});
    } catch (error) {
        console.log("Error al trobar la sessió del usuari", error);
        res.status(500).send({ message: "Error al trobar la sessió del usuari" });
    }
}