const { logger } = require("./logging");
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

module.exports = function () {
  mongoose
    .connect({ MONGO_URI })
    .then(() => logger.info("Connected to MongoDB..."));
};
