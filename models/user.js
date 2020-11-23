const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

// Define model
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
});

// On Save Hook, encrypt password
// Before saving a model, run this function
userSchema.pre("save", function (next) {
  // Access instance of user
  const user = this;

  // Generate a salt then run callback
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }

    // Hash (encrypt) password + salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return next(err);
      }

      // Overwrite plain text password with encrypted password
      user.password = hash;
      console.log("THERE", user);
      next(); // Go ahead and save the model
    });
  });
});

// Add instance method called comparePassword. "candidatePassword" from user attempting to sign in.  "this.password" is a reference to user model.
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  // Behind the scenes bcrypt is doing the comparing and using the salt to hash the candidatePassword
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }

    callback(null, isMatch); // isMatch: boolean is the result of the compare
  });
};

// Create the model class
const ModelClass = mongoose.model("user", userSchema);

// Export model
module.exports = ModelClass;

/* Notes:
  1 Our local definition of what a user is.
  2 Schema > Model > Export
*/
