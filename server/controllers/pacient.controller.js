const MongoDBUser = require('../models/pacient.model');
pacientModel = new MongoDBUser();

exports.create = async (req, res) => {
    const pacient = req.body;
    console.log(pacient)
    if(!pacient.name || !pacient.date || !pacient.code){
        return res.status(400).send({
            message: "Tots els camps son obligatoris i no poden estar buits"
          });
    }
    //Check if exists
    pacientModel.create(pacient).then((err,result) => {
        res.status(200).send({ message: "Usuari creat Correctament" });
    }).catch((err) => {
        console.log("Error en la creació", err);
      });
};

exports.findAllbyAtrribute = async (req, res) => {
    try {
        const pacient = req.body;
        console.log(pacient);
        console.log("HELLOUDA");
        let result;
        if (Object.keys(pacient).length === 0) {
            console.log("HELLOUDA2");
            pacientModel.findAll((err, result) => {
                if (err) {
                    console.log("Error: ", err);
                    res.status(500).send({ error: 'Could not fetch the documents' });
                } else {
                    console.log(result);
                    res.status(200).send({ result });
                }
            });
        } else {
            console.log("HELLOUD3");
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