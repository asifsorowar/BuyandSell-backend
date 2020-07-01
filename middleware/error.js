const logger = require("../config/logger");

module.exports = (err, req, res, next) => {
  logger.error(err.message, err);

  if (err.name === "MongoError" && err.code === 11000) {
    for (let key in err.keyValue)
      return res
        .status(400)
        .send(`duplication key error of ${key}: ${err.keyValue[key]}`);
  }

  if (err.name === "ValidationError") {
    for (let path in err.errors) {
      return res.status(400).send(err.errors[path].message);
    }
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).send("Invalid mongoDB id");
  }

  return next(err);
};
