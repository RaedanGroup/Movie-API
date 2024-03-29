/**
 * Auth module for handling authentication using Passport and JWT.
 * 
 * This module defines the logic for authenticating a user with Passport, generating a JWT token for the user,
 * and handling the login route to authenticate users and return a JWT token.
 * 
 * @module auth
 */

const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

// Import the Passport configuration
require('./passport');

/**
 * Generates a JWT token for an authenticated user.
 * 
 * @param {Object} user - The user object for which to generate the token. Assumes the user object has a username.
 * @returns {string} The generated JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // The username encoded in the JWT.
    expiresIn: '7d', // Token expiration set to 7 days.
    algorithm: 'HS256' // Algorithm used to sign the token.
  });
}

/**
 * Sets up the login route using Passport for authentication and JWT for session management.
 * 
 * @param {Object} router - The router object from Express.
 */ 
module.exports = (router) => {
  /**
   * POST login route to authenticate a user and return a JWT token if successful.
   */
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right', // Error message on authentication failure.
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        // Generate JWT token for the authenticated user.
        let token = generateJWTToken(user.toJSON());
        // Return the user and token to the client.
        return res.json({ user, token });
      });
    })(req, res);
  });
}