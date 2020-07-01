const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const express = require("express");
const fileUpload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

const error = require("../middleware/error");
const users = require("../routes/users");
const auth = require("../routes/auth");

module.exports = (app) => {
  app.use(express.static("public"));
  app.use(express.json());
  app.use(cookieParser());
  app.use(fileUpload());
  app.use(mongoSanitize());
  app.use(helmet());
  app.use(xss());
  app.use(hpp());
  app.use(cors());
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // app.use("/api/departments", departments);
  // app.use("/api/batches", batches);
  // app.use("/api/courses", courses);
  // app.use("/api/notes", notes);
  // app.use("/api/questions", questions);
  // app.use("/api/crInfos", crInfos);
  // app.use("/api/teacherInfos", teacherInfos);
  // app.use("/api/comments", comments);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use(error);
};
