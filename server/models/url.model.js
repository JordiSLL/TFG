const mongoClient = require('../services/mongodb.service');
var mongo = require('mongodb');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { ObjectId } = require('mongodb');

class MongoDBUser {

  constructor(database) {
    this.database = database;
    this.collection = mongoClient.db('TFG').collection('Sessio');
  }

  async create(user) {
    try {
      const result = await this.collection.insertOne(user);
      return result.insertedId.toString();
    } catch (error) {
      throw error;
    }
  }

  async findSessionById(sessionId) {
    try {
      const objectId = new ObjectId(sessionId);
      const session = await this.collection.findOne({ _id: objectId });
      return session;
    } catch (error) {
      throw error;
    }
  }

  async  findSessionsByUserId(userId) {
    try {
      const sessions = await this.collection.find({ userId: userId }).toArray();
      return sessions;
    } catch (error) {
      throw error;
    }
  }

  async addVideoToSession(userId, sessionDate, video) {
    try {
      const result = await this.collection.updateOne(
        { userId: userId, date: sessionDate },
        { $push: { videos: video } }
      );
      return result.modifiedCount > 0; 
    } catch (error) {
      throw error;
    }
  }
}

const generateUniqueId = () => {
  const today = new Date();

  const year = today.getFullYear().toString().slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const hour = String(today.getHours()).padStart(2, '0');
  const minute = String(today.getMinutes()).padStart(2, '0');
  const second = String(today.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}${second}`;
};

ffmpeg.setFfmpegPath(ffmpegPath);

const createDirectory = (userDir, callback) => {
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  callback(null, userDir);
};

const convertVideo = (userId, callback) => {
  const userDir = path.join(__dirname, '..', 'uploads', 'user', userId);
  const today = new Date();
  const fileName = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.mp4`;
  const inputFilePath = path.join(userDir, 'video.webm');
  const outputFilePath = path.join(userDir, fileName);

  ffmpeg(inputFilePath)
    .outputOptions('-c:v libx264')
    .outputOptions('-preset slow')
    .outputOptions('-crf 22')
    .outputOptions('-c:a aac')
    .outputOptions('-b:a 128k')
    .on('end', () => {
      console.log('Archivo convertido correctamente a MP4');
      callback(null);
    })
    .on('error', (err) => {
      console.error('Error al convertir el archivo a MP4:', err);
      callback(err);
    })
    .save(outputFilePath);
};

module.exports = {
  MongoDBUser,
  createDirectory,
  convertVideo,
  generateUniqueId
};
