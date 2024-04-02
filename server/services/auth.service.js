const jwt = require("jsonwebtoken");
const config = require("../config/config");

const signToken = (payload) => {
  return jwt.sign(payload, config.AUTH_SECRET_KEY, { expiresIn: config.AUTH_KEY_EXPIRATION });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.AUTH_SECRET_KEY);
};

module.exports = {
  signToken,
  verifyToken,
};