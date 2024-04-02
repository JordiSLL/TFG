const auth = require('../services/auth.service');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied. No token provided.');
  
    try {
      const decoded = auth.verifyToken(token);
      req.user = decoded;
      next();
    } catch (ex) {
      res.status(400).send('Invalid token.');
    }
};

const authenticateUser = (req, res, next) => {
  authenticate(req, res, () => {
    const userId = req.user.id;
    if (req.user.id != userId) {
      return res.status(403).json({
        err: 'Access denied. You are not authorized to access this data.'
      });
    }
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
    // Verificar si el usuario es un administrador
    if (!req.user || !req.user.isAdmin) return res.status(403).send('Access denied. Admin privileges required.');
    next();
};

const checkAuth = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.isAdmin) {
      authenticateAdmin(req, res, next);
    } else {
      authenticateUser(req, res, next);
    }
  });
};

module.exports = {
  authenticate,
  authenticateUser,
  authenticateAdmin,
  checkAuth
};