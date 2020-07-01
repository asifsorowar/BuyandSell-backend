require("colors");
const mongoose = require("mongoose");

module.exports = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => console.log("Connected to mongodb...".green.bold.underline))
    .catch(() =>
      console.log("Could not connect to mongodb....".red.bold.underline)
    );
};
