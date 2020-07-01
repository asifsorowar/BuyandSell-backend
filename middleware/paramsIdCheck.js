const mongoose = require("mongoose");

module.exports = (req, res, next) => {
  if (req.params) {
    for (let key in req.params) {
      if (!mongoose.Types.ObjectId.isValid(req.params[key]))
        return res.status(400).send(`${key} isn't valid`);
    }
  }

  return next();
};
