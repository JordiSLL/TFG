const path = require('path');
const multer = require('multer');
const model = require('../models/url.model');
const mongoDBSession = new model.MongoDBUser();
const modelPacient = require('../models/pacient.model');
const mongoDBpacient = new modelPacient()
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

exports.renderUserDashboard = async (req, res) => {
    console.log(req.params.userId);
    if (req.params.userId) {
        var user = await mongoDBpacient.getUserById(req.params.userId);
        //console.log(user)
        if (user.error) {
            console.log('Error:', user.error);
            return res.redirect('/main');
        }
    }
    res.sendFile(path.join(clientPath, 'userDashboard.html'));
};

exports.renderSessionDashboard = async (req, res) => {
    console.log(req.params.sessionId)
    if (req.params.userId) {
        var user = await mongoDBpacient.getUserById(req.params.userId);
        //console.log(user)
        if (user.error) {
            console.log('Error:', user.error);
            return res.redirect('/main');
        }
    }
    if (req.params.sessionId) {
        var session = await mongoDBSession.findSessionById(req.params.sessionId);
        //console.log(session)
        if (session.error) {
            console.log('Error:', session.error);
            return res.redirect('/main');
        }else{
            const userSessionVerif = session.userId === req.params.userId;
            if (!userSessionVerif) {
                return res.redirect('/main');
            }
        }
    }
    res.sendFile(path.join(clientPath, 'sessionDashboard.html'));
};

exports.renderVideoDashboard = async (req, res) => {
    if (req.params.userId) {
        var user = await mongoDBpacient.getUserById(req.params.userId);
        //console.log(user)
        if (user.error) {
            console.log('Error:', user.error);
            return res.redirect('/main');
        }
    }
    if (req.params.sessionId) {
        var session = await mongoDBSession.findSessionById(req.params.sessionId);
        //console.log(session)
        if (session.error) {
            console.log('Error:', session.error);
            return res.redirect('/main');
        } else {
            const userSessionVerif = session.userId === req.params.userId;
            if (!userSessionVerif) {
                return res.redirect('/main');
            }
            const videoExists = session.videos.some(video => video.id === req.params.videoId);
            if (!videoExists) {
                return res.redirect('/main');
            }
        }
    }
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
        const videoDir = path.join(__dirname, '..', 'uploads', 'user', userId, "session", currentSession, "videos", currentVideo);

        const video = {
            id: currentVideo,
            path:videoDir
        };

        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }

        const updateSuccess = await mongoDBSession.addVideoToSession(userId, currentSession, video);

        

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
        const sessionId = await mongoDBSession.create(session);
        const sessionDir = path.join(__dirname, '..', 'uploads', 'user', session.userId, "session", session.date, "videos");
        createDirectory(sessionDir);
        res.status(200).send({ message: "Sessio creada correctament", sessionDate: session.date, sessionId: sessionId });
    } catch (error) {
        console.log("Error en la creació", error);
        res.status(500).send({ message: "Error al crear la sessió" });
    }
};

exports.getprediction = async (req, res) => {
    const video = req.body;
    console.log(video.videoPath)
    const predictionPath = path.join(video.videoPath,'predictions.json');
    fs.readFile(predictionPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err);
            res.status(500).json({ error: 'Error al leer el archivo JSON' });
            return;
        }

        try {
            const sessionData = JSON.parse(data);
            res.json(sessionData);
        } catch (parseErr) {
            console.error('Error al parsear el archivo JSON:', parseErr);
            res.status(500).json({ error: 'Error al parsear el archivo JSON' });
        }
    });
};

function createDirectory(directory) {
    model.createDirectory(directory, (err, userDir) => {
        if (err) {
            console.error("Error al crear el directori", err);
            return res.status(500).send({ message: "Error al crear el directori" });
        }
    });
}

exports.getSessionsByUserID = async (req, res) => {
    const user = req.body;
    console.log(user)
    if (!user.userId) {
        return res.status(400).send({ message: "Error al trobar les sessions de l'usuari" });
    }
    try {
        const sessions = await mongoDBSession.findSessionsByUserId(user.userId);
        res.status(200).send({ message: "Sense error al busscar les sessions del usuari", sessions: sessions });
    } catch (error) {
        console.log("Error al trobar les sessions del usuari", error);
        res.status(500).send({ message: "Error al trobar les sessions del usuari" });
    }
}

exports.getSessionByID = async (req, res) => {
    const sessionId = req.body;
    if (!sessionId.sessionId) {
        return res.status(400).send({ message: "Error al trobar la sessió de l'usuari" });
    }
    try {
        const session = await mongoDBSession.findSessionById(sessionId.sessionId);
        console.log(session)
        res.status(200).send({ message: "Sense error al busscar la sessió del usuari", session: session });
    } catch (error) {
        console.log("Error al trobar la sessió del usuari", error);
        res.status(500).send({ message: "Error al trobar la sessió del usuari" });
    }
}