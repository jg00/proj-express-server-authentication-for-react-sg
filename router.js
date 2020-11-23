const Authentication = require("./controllers/authentication");
const passportService = require("./services/passport");
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false }); // Use 'jwt' strategy. When a user is authenticated do not create a cookie-session that is created by default.
const requireSignin = passport.authenticate("local", { session: false });

module.exports = function (app) {
  // GET "/" - Example: protect access to route handler - password-jwt strategy
  app.get("/", requireAuth, function (req, res) {
    res.send({ hi: "there" });
  });

  // Sign in to some protected resource - Verify email/password - passport-local strategy
  app.post("/signin", requireSignin, Authentication.signin);

  // Sign up - exchange new user for jwt token
  app.post("/signup", Authentication.signup);
};

/* Works as well
  const express = require("express");

  const router = express.Router();

  router.get("/", (req, res, next) => {
    console.log("test");
    res.send("text");
  });

  module.exports = router;
*/
