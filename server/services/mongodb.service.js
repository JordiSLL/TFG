const { MongoClient } = require('mongodb');
const config = require("../config/config");

const uri = `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}`;
const mongodbClient = new MongoClient(uri, { useNewUrlParser: false, useUnifiedTopology: true });

async function connectToMongo() {
    console.log('Connecting to MongoDB...');
    try {
        await mongodbClient.connect();
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.log(`Error connecting to MongoDB: ${err}`);
    }
}

connectToMongo();

module.exports = mongodbClient;