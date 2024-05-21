const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/url.controller');

const clientPath = path.join(__dirname, '..', 'client');
router.use(express.static(clientPath));

// Rutas
router.get('/', controller.renderLoginRegister);
router.get('/main', auth.checkAuth, controller.renderMain);
router.get('/documentation', auth.checkAuth, controller.renderDocumentation);
router.get('/userDashboard', auth.checkAuth, controller.renderUserDashboard);
router.get('/sessionDashboard/:sessionId', auth.checkAuth, controller.renderSessionDashboard);
router.get('/videoDashboard/:sessionId/:videoId', auth.checkAuth, controller.renderVideoDashboard);
//
router.post('/uploadVideo', auth.checkAuth, controller.uploadVideo);
router.post('/createSession', auth.checkAuth, controller.createSession);
router.post('/getSessionsByUserID', auth.checkAuth, controller.getSessionsByUserID);
router.post('/getSessionByUserID', auth.checkAuth, controller.createSession);

module.exports = router;