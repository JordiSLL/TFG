require("dotenv").config({path:__dirname+'/../.env'});

const config = {
  PORT: process.env.PORT || "",
  MONGO_HOST: process.env.MONGO_HOST || "",
  MONGO_PORT: process.env.MONGO_PORT || "",
  MONGO_USER: process.env.MONGO_USER || "",
  MONGO_PASSWORD: process.env.MONGO_PASSWORD || "",
  MONGO_DATABASE: process.env.MONGO_DATABASE || "",
  
};

module.exports = config;