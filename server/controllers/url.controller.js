const path = require('path');
const multer = require('multer');
const model = require('../models/url.model');
const mongoDBSession = new model.MongoDBUser();
const modelPacient = require('../models/pacient.model');
const mongoDBpacient = new modelPacient()
const { sendVideoToAPI, getJsonAPI, getJobDetail } = require('../services/humeai.service');
const { analyzeJsonVideo, analyzeJsonSession } = require('../services/analyze.service');
const fs = require('fs');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfprobePath(ffprobePath);

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
        } else {
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
            path: videoDir,
            duration: 0,
            job_id: 0
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

        model.convertVideo(videoDir, (err) => {
            if (err) {
                return console.log('Error al convertir el archivo a MP4');
            }
            console.log('Vídeo subido y convertido correctamente a MP4');
            ffmpeg.ffprobe(path.join(videoDir, "video.mp4"), (err, metadata) => {
                if (err) {
                    console.error('Error al obtener metadata del archivo:', err);
                }
                video.duration = metadata.format.duration;
                mongoDBSession.updateVideoDuration(userId, currentSession, currentVideo, video.duration)
                    .then(() => {
                        console.log("Vídeo subido correctamente: Duració: " + video.duration);
                    })
                    .catch(err => {
                        console.error('Error al actualizar la duración del video en la base de datos:', err);
                    });
            });
        });
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
    const predictionPath = path.join(video.videoPath, 'predictions.json');
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

exports.getVideo = async (req, res) => {
    if (req.params.userId) {
        var user = await mongoDBpacient.getUserById(req.params.userId);
        //console.log(user)
        if (user.error) {
            console.log('Error:', user.error);
            return res.status(500).send({ message: "Error al trobar la sessió del usuari" });
        }
    }
    if (req.params.sessionId) {
        var session = await mongoDBSession.findSessionById(req.params.sessionId);
        //console.log(session)
        if (session.error) {
            console.log('Error:', session.error);
            return res.status(500).send({ message: "Error al trobar l'usuari" });
        } else {
            const userSessionVerif = session.userId === req.params.userId;
            if (!userSessionVerif) {
                return res.status(500).send({ message: "Error al trobar la sessió del usuari" });
            }
            const videoExists = session.videos.some(video => video.id === req.params.videoId);
            if (!videoExists) {
                return res.status(500).send({ message: "Error al trobar el video de la sessió del usuari" });
            }
            const video = session.videos.find(video => video.id === req.params.videoId);
            //console.log(path.join(video.path, 'test.mkv'));
            try {
                res.sendFile(path.join(video.path, 'video.mp4'));
            }
            catch (error) {
                console.log("No existeix el arxiu de video.")
                res.status(500).send({ message: "Error al trobar el video de la sessió del usuari" });
            }
        }
    }
    //return res.status(500).send({ message: "Error al trobar el video de la sessió del usuari" });
}

exports.processVideoHumeAi = async (req, res) => {
    try {
        var session = await mongoDBSession.findSessionById(req.body.sessionId);
        console.log(session);

        for (const video of session.videos) {
            if (video.job_id == 0 || video.job_id == -1) {
                const jobId = await sendVideoToAPI(path.join(video.path, "video.mp4"));
                const result = await mongoDBSession.updateJobId(req.body.userId, req.body.sessionId, video.id, jobId);
                console.log(result);
            }
        }
        session = await mongoDBSession.findSessionById(req.body.sessionId);
        let hasError = false;
        let errorCount = 0;
        for (const video of session.videos) {
            if (video.job_id === -1) {
                hasError = true;
                errorCount++;
            }
        }
        if (hasError) {
            return res.status(500).send({ message: `ERROR: Intenta tornar a processar la sessió. Videos no processats: ${errorCount}` });
        } else {
            mongoDBSession.updateSessionEstado(req.body.userId, req.body.sessionId, 2)
            res.status(200).send({ message: "Videos sent to API successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while sending videos to API" });
    }
};

exports.getJobVideoHumeAi = async (req, res) => {
    console.log(req.body.userId)
    console.log(req.body.sessionId)

    const session = await mongoDBSession.findSessionById(req.body.sessionId);
    for (const video of session.videos) {
        if (session.IdEstado == 2) {
            const result = getJobDetail(video.job_id);
            if (result === "FAILED") {
                console.log('Error en el processament dels videos');
                return res.status(500).send({ message: "ERROR en el processament dels videos" });
            } else if (result === "QUEUED" || result === "IN_PROGRESS") {
                console.log("Els videos encara no s'han processat");
                return res.status(500).send({ message: "Els videos encara no s'han processat." });
            }
        } else {
            console.log("La sessió no té el estat correcte.");
            return res.status(500).send({ message: "La sessió no té el estat correcte." });
        }
    }

    for (const video of session.videos) {
        const response = await getJsonAPI(video.job_id);
        if (response) {
            const isSaved = await model.saveJsonToFile(response, video.path);
            console.log(isSaved)
            if (isSaved) {
                console.log('File saved successfully.');
                const emotions = analyzeJsonVideo(response);
                console.log(emotions)
                if (emotions) {
                    const result = await mongoDBSession.updateVideoEmotion(req.body.userId, req.body.sessionId, video.id, emotions);
                    console.log("result: " + result)
                } else {
                    console.log('An error occurred while processing the emotions.');
                    return res.status(500).send({ message: "Error al processar les emocions del JSON" });
                }
            } else {
                console.log('An error occurred while saving the file.');
                return res.status(500).send({ message: "Error al guardar el JSON" });
            }
        } else {
            return res.status(500).send({ message: "Error en la petició del JOB" });
        }
    }
    const sessionWithEmotions = await mongoDBSession.findSessionById(req.body.sessionId);
    const emotions = analyzeJsonSession(sessionWithEmotions);
    if (emotions) {
        const result = await mongoDBSession.updateSessionEmotion(req.body.userId, req.body.sessionId, emotions);
        console.log("result: " + result)
        // if(result){
        mongoDBSession.updateSessionEstado(req.body.userId, req.body.sessionId, 4)
        res.status(200).send({ message: "El processament de les emocions dels videos a finalitzat Correctament" });
        //}
    } else {
        return res.status(500).send({ message: "Error en processar les emocions de la Sessió" });
    }

}