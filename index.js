require("colors");
const express = require("express");
const app = express();

require("./startup/config")();
require("./startup/validation")();
require("./startup/db")();
require("./startup/router")(app);

const { PORT, NAME, NODE_ENV } = process.env;

const port = PORT || 3000;
app.listen(
  port,
  console.log(
    `listening ${NAME}- ${NODE_ENV} to this ${port}.....`.green.bold.underline
  )
);
