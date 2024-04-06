const mongoClient = require("../services/mongodb.service");
var mongo = require('mongodb');


class MongoDBUser{
  constructor(database) {
    this.database = database;
    this.collection = mongoClient.db('TFG').collection('Medico');
  }

  async create(user, cb) {
    this.collection.insertOne(user, (err, result) => {
      if (err) return cb(err);
      cb(null, result.insertedId.toString());
    });
  }


  async get(id,cb) {
    this.collection.findOne({ _id: new mongo.ObjectId(id) }).then((result) => {
      cb(null, result);
    }).catch((err) => {
      cb(err);
    }); 
  }

  async getAll(cb) {
    this.collection.find().toArray().then((result) => {
      cb(null, result);
    }).catch((err) => {
      cb(err);
    });
  }

  async getByEmail(email,cb) {
    const result = await this.collection.findOne({ email: email });
    return result;
  }
  async getUserByEmail(email, cb) {
    this.collection.findOne({ email: email }).then((result) => {
      cb(null, result);
    }).catch((err) => {
      cb(err);
    }); 
  }
  
  async getIdByEmail(email) {
    const result = await this.collection.findOne({ email: email }, { projection: { _id: 1 } });
    return result && result._id.toString();
  }

  /*async update(id, updates) {
    const result = await this.collection.updateOne({ _id: id }, { $set: updates });
    return result.modifiedCount > 0;
  }*/

  update(id, updates) {
    return this.collection.updateOne({ _id: new mongo.ObjectId(id) }, { $set: updates })
      .then(result => result.modifiedCount > 0)
      .catch(err => {
        throw err;
      });
  }

  delete(id, cb) {
      this.collection.deleteOne({ _id: new mongo.ObjectId(id) }).then((result) =>{
      cb(null, result);
      return result.deletedCount > 0;
    }).catch ((err) => {
      cb(err);
    });
  }
}

module.exports = MongoDBUser;