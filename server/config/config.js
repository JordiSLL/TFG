require("dotenv").config({path:__dirname+'/../.env'});

const config = {
  AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY || "secret_key",
  AUTH_KEY_EXPIRATION: process.env.AUTH_KEY_EXPIRATION || "10h",
  CODE_REGISTRATION: process.env.CODE_REGISTRATION || "",
  
  PORT: process.env.PORT || "",
  MONGO_HOST: process.env.MONGO_HOST || "",
  MONGO_PORT: process.env.MONGO_PORT || "",
  MONGO_USER: process.env.MONGO_USER || "",
  MONGO_PASSWORD: process.env.MONGO_PASSWORD || "",
  MONGO_DATABASE: process.env.MONGO_DATABASE || "",
  API_HUMEAI: process.env.API_HUMEAI || ""
};

module.exports = config;