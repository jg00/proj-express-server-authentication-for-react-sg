const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config");

// JWT token settings.  Properties: 'sub':subject (represents subject of the token). 'iat': issued at time.
// jwt.sign(payload, secretOrPrivateKey, [options, callback])
// iat issued at timestamp
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.sign({ sub: user.id, iat: timestamp }, config.secret);
}

// Sign In Controller
exports.signin = function (req, res, next) {
  // User has already had their email and password authorized via passport-local strategy
  // We just need to give them a token
  // Need access to the current user model. Note Passport will have assigned req.user from it's done() callback.

  res.send({ token: tokenForUser(req.user) });
};

// Sign Up Controller.  Create a jwt token with userId if user is created.
exports.signup = function (req, res, next) {
  // See if a user with a given email exits
  const { email, password } = req.body;

  // Pre check
  if (!email || !password) {
    return res
      .status(422)
      .send({ error: "You must provide email and password" });
  }

  User.findOne({ email: email }, function (err, existingUser) {
    if (err) {
      return next(err);
    }

    // If a user with email does exists, return an error
    if (existingUser) {
      return res.status(422).send({ error: "Email is in use" });
    }

    // If a user with email does NOT exits, create and save user record
    const user = new User({ email: email, password: password });

    user.save(function (err) {
      if (err) {
        return next(err);
      }

      // Respond to request indicating the user was created; Note the returned user is the whole user model. We don't want to send back which will include the password.
      // Instead what we want to return a JWT token and on it a user id
      // res.json({ success: true }); // {"id":_ , "email":_, "password":_}

      res.json({ token: tokenForUser(user) });
    });
  });
};
