/* Purpose is for authenicating user when they attempt to access protected controllers */
const passport = require("passport");
const User = require("../models/user");
const config = require("../config");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local");

/* Strategy passport-local - for sign in */
// 2 Create local strategy.  LocalStrategy by default is looking for 'username' and 'password' in the request.  We can change in the config below.
const localOptions = { usernameField: "email" };
const localLogin = new LocalStrategy(localOptions, function (
  email,
  password,
  done
) {
  // Verify this username and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  // Note 'done' is the passport's callback to indicate status to passport.

  User.findOne({ email: email }, function (err, user) {
    if (err) {
      return done(err);
    } // Db access error

    if (!user) {
      return done(null, false);
    } // No user found

    // Compare passwords - is "password" (from this function's args) equal to user.password?  Here we have user instance from user model
    user.comparePassword(password, function (err, isMatch) {
      if (err) {
        return done(err);
      }

      if (!isMatch) {
        return done(null, false);
      } // false ie no user with the password matched; Unauthorized

      return done(null, user); // call the passport callback with the user model. Note Passport assigns user to req.user.
    });
  });
});

/* Strategy passport-jwt - for authentication to access route handlers, resource access */
// Set up options for JWT strategy
// Where is JWT on the request?  Could be contained in the body, within url, headers of the request, etc.  We need to specify where to look for JWT on the request.
// Verify token with key, check user exists, indicate to Passport via done() callback user is/is not found.
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"), // 'authorization' is header name
  secretOrKey: config.secret,
};

// Create JWT strategy. new JwtStrategy(options, verify). 'done' is the passport's callback to indicate status to passport.
const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
  // See if the user id in the payload exists in our database
  // If it does, call 'done' with that user ie is user is now authenticated
  // otherwise, call done without a user object
  User.findById(payload.sub, function (err, user) {
    // Check for any errors in process of searching for a user. Ex no access to the database.
    if (err) {
      return done(err, false); // ie error accessing db, etc. so return done with err and user is not authenticated.
    }

    // If no errors in process then indicate to passport (using done() cb) if user is found or not
    if (user) {
      done(null, user); // User can be returned and Passport will place in req.user available for next middleware and/or route handler.
    } else {
      done(null, false); // Unauthorized returned.
    }
  });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);

/*
  1 In passport, a strategy is a method for authenticating a user in a particular fashion.
  Here we are using a strategy using JWT.
  One strategy is passport-jwt that will attempt to verify user with a JWT.

  2 JwtStrategy(jwtOptions, function (payload, done) {}
  Function runs whenever a user tries to log in with a JWT.
  payload is the decoded JWT token {sub:.., iat:..}
  done is callback we need to call depending on whether or not we were able to successfully authenticate a user

  3 Notes on setup:
  passport.js
  - contains the strategy along with the options (configuration)
  - passport.use(jwtLogin) adss the strategy to passport
  - notice no export
    - this module is self-contained.  It runs where we require it.  However we do not need
      to interact with any code in this module via a variable from the importing code.
    - Example we require() in the router.js
  - to make use of it in the importing code we run passport.authenticate('jwt', {session: false})
    - we are telling passport we do not to by default need a session created.
*/
