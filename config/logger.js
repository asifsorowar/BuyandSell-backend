const winston = require("winston");
require("winston-mongodb");

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "./log/logfile.log",
      level: "error",
    }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      level: "error",
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "./log/exceptions.log" }),
  ],
});
process.on("unhandledRejection", (ex) => {
  logger.error(ex.message, ex);
  process.exit(1);
});

module.exports = logger;
