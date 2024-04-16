const auth = require('../services/auth.service.js');
const MongoDBUser = require('../models/user.model');
const config = require("../config/config");
const bcrypt = require('bcrypt');
userModel = new MongoDBUser();

exports.create = async (req, res) => {
  const user = req.body;
  console.log(user)
  const salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(user.password, salt);
  // check if any value is missing
  if (!user.name || !user.email || !user.password) {
    return res.status(400).send({
      message: "Content can not be empty"
    });
  }
  if (!user.code || user.code != config.CODE_REGISTRATION) {
    return res.status(400).send({
      message: "Codigo de Registro Incorrecto"
    });
  }
  delete user.code;
  console.log("Usuario a crear", user);
  //Check if exists
  userModel.getUserByEmail(user.email, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result) return res.status(400).send({
      message: "El usuari ja existeix"
    });
    userModel.create(user).then((err, result) => {
      var token = auth.signToken(user);
      const maxAge = 3 * 24 * 60 * 60;
      res.cookie('Token', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).send({ user, token: token });
    }).catch((err) => {
      console.log("Error en la creació", err);
    });
  });
};

exports.login = (req, res) => {
  const user = req.body;
  if (!user.email || !user.password) {
    return res.status(400).send({
      message: "Content can not be empty"
    });
  }
  console.log("Usuario loggeado pibe", user);
  userModel.getUserByEmail(user.email, (err, result) => {
    if (err) return res.status(500).send(err);
    if (!result) return res.status(404).send("User not found");
    bcrypt.compare(user.password,result.password , (err, result) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return;
      }
      if (result) {
        delete result.password;
        var token = auth.signToken(user);
        const maxAge = 3 * 24 * 60 * 60;
        res.cookie('Token', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).send({ user: user, token: token});
      } else {
        return res.status(401).send("Contrasenya incorrecta");
      }
    });
  });
}

exports.update = (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  userModel.update(userId, updates)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      res.status(500).send(err);
    });
  console.log("Datos de usuario actualizados", updates);
};

// Retrieve all users
exports.findAll = (req, res) => {
  userModel.getAll((err, result) => {
    if (err) return res.status(500).send(err);
    let users = {};
    for (let id in result) {
      let user = result[id];
      //delete user.password;
      user.id = user._id
      users[user.id] = user;
    }
    res.status(200).send(users);
  });
}

exports.findOne = (req, res) => {
  const userId = req.params.id;
  userModel.get(userId, (err, result) => {
    if (err) return res.status(500).send(err);
    if (!result) return res.status(404).send("User not found");
    res.status(200).send(result);
  });
};

exports.delete = (req, res) => {
  const userId = req.params.id;
  userModel.delete(userId, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.deletedCount > 0) {
      res.status(200).send({
        message: "User deleted successfully"
      });
    } else {
      res.status(404).send({
        message: "User not found"
      });
    }
  });
};

exports.logout = (req, res) => {
  res.cookie('Token', '', { httpOnly: true, maxAge: 1 });
  res.redirect('/');
};