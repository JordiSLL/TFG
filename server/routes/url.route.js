const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/url.controller');

const clientPath = path.join(__dirname, '..', 'client');
router.use(express.static(clientPath));

// Rutas de navegación
router.get('/', controller.renderLoginRegister);
router.get('/main', auth.checkAuth, controller.renderMain);
router.get('/documentation', auth.checkAuth, controller.renderDocumentation);
router.get(['/Dashboard', '/Dashboard/:userId'], auth.checkAuth, controller.renderUserDashboard);
router.get('/Dashboard/:userId/:sessionId', auth.checkAuth, controller.renderSessionDashboard);
router.get('/Dashboard/:userId/:sessionId/:videoId', auth.checkAuth, controller.renderVideoDashboard);
//Session and video routes
router.get('/video/:userId/:sessionId/:videoId', auth.checkAuth, controller.getVideo);
router.post('/uploadVideo', auth.checkAuth, controller.uploadVideo);
router.post('/createSession', auth.checkAuth, controller.createSession);
router.post('/getSessionsByUserID', auth.checkAuth, controller.getSessionsByUserID);
router.post('/getSessionByID', auth.checkAuth, controller.getSessionByID);
router.post('/getVideoPrediction',auth.checkAuth,controller.getprediction);
router.post('/procesVideos',auth.checkAuth,controller.processVideoHumeAi);
router.post('/getAllPredictionVideos',auth.checkAuth,controller.getJobVideoHumeAi);
module.exports = router;