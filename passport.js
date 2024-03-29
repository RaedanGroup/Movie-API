/**
 * Passport authentication configuration.
 * 
 * This module configures Passport to use local and JWT strategies for authentication.
 * The local strategy authenticates users based on username and password,
 * while the JWT strategy validates users based on a provided JSON Web Token.
 * 
 * @module passport
 */

const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Passport Local Strategy for authentication with username and password.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },

    /**
     * Verify callback for the local strategy.
     * 
     * Searches for a user by username. If found, it validates the password.
     * If the authentication is successful, it proceeds with the user object.
     * Otherwise, it returns a message indicating the failure reason.
     * 
     * @param {string} username - The username from the request.
     * @param {string} password - The password from the request.
     * @param {function} callback - A callback to call with the user object or false.
     */
    async (username, password, callback) => {
      await Users.findOne({ username: username })
      .then((user) => {
        if (!user) {
          console.log('incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }
      if (!user.validatePassword(password)) {
        console.log('incorrect password');
        return callback(null, false, { message: 'Incorrect password.' });
      }
        console.log('finished');
        return callback(null, user);
      })
      .catch((error) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
      })
    }
  )
);

/**
 * Passport JWT Strategy for authentication with a JSON Web Token.
 * 
 * Extracts the JWT from the request's authorization header. Validates the token
 * and retrieves the user based on the ID encoded in the token.
 */
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // Method to extract JWT from the request.
  secretOrKey: 'your_jwt_secret' // The secret key to verify the JWT's signature. Should be kept secret and secure.
}, async (jwtPayload, callback) => {
  return await Users.findById(jwtPayload._id)
    .then((user) => {
      return callback(null, user); // Returns the user to the requester if the token is valid.
    })
    .catch((error) => {
      return callback(error) // Handles any errors encountered.
    });
}));