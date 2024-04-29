const mongoClient = require("../services/mongodb.service");
var mongo = require('mongodb');

class MongoDBUser {
    constructor(database) {
        this.database = database;
        this.collection = mongoClient.db('TFG').collection('Pacient');
    }

    async create(user) {
        try {
          const result = await this.collection.insertOne(user);
          return result.insertedId.toString();
        } catch (error) {
          throw error;
        }
      }

    async findAllWithSpecificValue(fieldName, specificValue, cb) {
        try {
            // Perform the find operation with $in operator
            this.collection.find({ [fieldName]: { $in: [specificValue] } }).toArray((err, result) => {
                if (err) {
                    console.error('Error finding documents:', err);
                    return cb(err); 
                }
                cb(null, result); 
            });
        } catch (error) {
            console.error('Error finding documents:', error);
            throw error; 
        }
    }

    async findAll(cb) {
        this.collection.find().toArray().then((result) => {
          cb(null, result);
        }).catch((err) => {
          cb(err);
        });
      }

    async getUserByCode(code, cb) {
        this.collection.findOne({ code: code }).then((result) => {
            cb(null, result);
        }).catch((err) => {
            cb(err);
        });
    }

}

module.exports = MongoDBUser;