const mongoClient = require("../services/mongodb.service");
var mongo = require('mongodb');

class MongoDBUser {
    constructor(database) {
        this.database = database;
        this.collection = mongoClient.db('TFG').collection('Sessio');
    }

}
module.exports = MongoDBUser;   