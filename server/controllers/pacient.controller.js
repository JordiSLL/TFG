const MongoDBUser = require('../models/pacient.model');
const path = require('path');
const fs = require('fs');
pacientModel = new MongoDBUser();

exports.create = async (req, res) => {
    const pacient = req.body;
    console.log(pacient)
    if (!pacient.name || !pacient.date || !pacient.code) {
        return res.status(400).send({
            message: "Tots els camps son obligatoris i no poden estar buits"
        });
    }
    try {
        const userId = await pacientModel.create(pacient);
        console.log("UserID: " + userId);
        const userDir = path.join(__dirname, '..', 'uploads', 'user', userId);
        console.log("userdir: " + userDir);
        fs.mkdir(userDir, { recursive: true }, (err) => {
            if (err) {
                console.log("Error al crear la carpeta de l'usuari", err);
                return res.status(500).send({ message: "Error al crear la carpeta de l'usuari" });
            }
            res.status(200).send({ message: "Usuari creat correctament", userId: userId });
        });
    } catch (error) {
        console.log("Error en la creació", error);
        res.status(500).send({ message: "Error al crear l'usuari" });
    }
};


exports.findPacientById = async (req, res) => {
    try {
        const pacient = req.body;
        console.log("Start")
        console.log(pacient)
        var user = await pacientModel.getUserById(pacient.userId);
        console.log(user)
        if (user.error) {
            console.log('Error:', user.error);
            res.status(400).send({ error: 'User not found' });
        }
        return res.status(200).send({ message: "Usuari creat correctament", user: user });;

    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send({ error: 'Could not fetch the user' });
    }
};

exports.findAllbyAtrribute = async (req, res) => {
    try {
        const pacient = req.body;
        //console.log(pacient);
        let result;
        if (Object.keys(pacient).length === 0) {
            pacientModel.findAll((err, result) => {
                if (err) {
                    console.log("Error: ", err);
                    res.status(500).send({ error: 'Could not fetch the documents' });
                } else {
                    //console.log(result);
                    res.status(200).send({ result });
                }
            });
        } else {
            pacientModel.findAllbyAtrribute("", (err, result) => {
                if (err) {
                    console.log("Error: ", err);
                    res.status(500).send({ error: 'Could not fetch the documents' });
                } else {
                    res.status(200).send({ result });
                }
            });
        }
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send({ error: 'Could not fetch the documents' });
    }
};