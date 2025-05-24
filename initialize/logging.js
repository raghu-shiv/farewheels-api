require("express-async-errors");
const winston = require("winston");
require("winston-mongodb");

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: "error",
      filename: "error.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
  // exceptionHandlers: [
  //   new winston.transports.File({ filename: "exceptions.log" }),
  // ],
  // exitOnError: false,
  // rejectionHandlers: [
  //   new winston.transports.File({ filename: "rejections.log" }),
  // ],
});

logger.add(
  new winston.transports.MongoDB({
    level: "error",
    db: "mongodb://127.0.0.1:27017/FareWheels",
  })
);

logger.exceptions.handle(
  new winston.transports.File({ filename: "exceptions.log" }),
  new winston.transports.Console()
);

logger.rejections.handle(
  new winston.transports.File({ filename: "rejections.log" })
);

module.exports.logger = logger;
