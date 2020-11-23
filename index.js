const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const router = require("./router");

const app = express();

// DB Setup: mongod --dbpath /usr/local/var/mongodb
mongoose.connect("mongodb://localhost:auth/auth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

/*
  // For dev or prod environments
  if (process.env.NODE_ENV !== "test") {
    mongoose.connect("mongodb://localhost/muber", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  }
*/

// App Setup
app.use(morgan("combined"));
app.use(bodyParser.json({ type: "*/*" }));
// app.use(bodyParser.urlencoded({ extended: false }));
router(app);

// Server Setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log("Server listening on:", port);

// app.listen(3000, () => {
//   console.log("Listening on 3000");
// });
