const mongoClient = require('../services/mongodb.service');
var mongo = require('mongodb');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
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
      if (!ObjectId.isValid(sessionId)) {
        return { error: 'Invalid sessionId format' };
      }
      const objectId = new ObjectId(sessionId);
      const session = await this.collection.findOne({ _id: objectId });
      if (!session) {
        return { error: 'Session not found' };
      }
      return session;
    } catch (error) {
      throw error;
    }
  }

  async findSessionsByUserId(userId) {
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

  async updateVideoDuration(userId, sessionDate, videoId, videoDuration) {
    try {
      const result = await this.collection.updateOne(
        { userId: userId, date: sessionDate, "videos.id": videoId },
        { $set: { "videos.$.duration": videoDuration } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  async updateJobId(userId, sessionId, videoId, JobId) {
    try {
      const objectId = new ObjectId(sessionId);
      const result = await this.collection.updateOne(
        { userId: userId, _id: objectId, "videos.id": videoId },
        { $set: { "videos.$.job_id": JobId } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  async updateVideoEmotion(userId, sessionId, videoId, emotions) {
    try {
        // Espera a que la promesa emotions se resuelva
        const data = await emotions;

        if (!ObjectId.isValid(sessionId)) {
            return { error: 'Invalid sessionId format' };
        }

        const objectId = new ObjectId(sessionId);
        const result = await this.collection.updateOne(
            { userId: userId, _id: objectId, "videos.id": videoId },
            { 
                $set: {
                    "videos.$.emotion.Face": data.listFace,
                    "videos.$.emotion.Language": data.listLanguage,
                    "videos.$.emotion.Prosody": data.listProsody
                } 
            }
        );

        console.log("Modified count:", result.modifiedCount);
        return result.modifiedCount > 0;
    } catch (error) {
        throw error;
    }
}
}

const generateUniqueId = () => {
  const today = new Date();
  const adjustedHours = today.getHours() + 2;
  if (adjustedHours >= 24) {
    today.setDate(today.getDate() + 1);
  }
  const hour = String(adjustedHours % 24).padStart(2, '0');

  const year = today.getFullYear().toString().slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
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

const convertVideo = (filePath, callback) => {
  const today = new Date();
  const inputFilePath = path.join(filePath, 'video.webm');
  const outputFilePath = path.join(filePath, 'video.mp4');

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

const saveJsonToFile = async (jsonData, directoryPath) => {
  try {
      console.log(jsonData);

      if (!await fsp.access(directoryPath).catch(() => true)) {
          await fsp.mkdir(directoryPath, { recursive: true });
      }
      
      const filePath = path.join(directoryPath, 'predictions.json');
      const jsonString = JSON.stringify(jsonData, null, 2);
      
      await fsp.writeFile(filePath, jsonString, 'utf8');
      console.log('File has been saved');
      return true;
  } catch (err) {
      console.log('Error writing file', err);
      return false;
  }
};

const searchAllVideos = (userId, sessionId) => {
  console.log(userId)
  console.log(sessionId)

};

module.exports = {
  MongoDBUser,
  createDirectory,
  convertVideo,
  generateUniqueId,
  saveJsonToFile,
  searchAllVideos
};
