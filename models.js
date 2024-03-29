/**
 * Models module.
 * 
 * Defines Mongoose schemas for the "movie" and "user" collections, including their structure and behavior.
 * This module creates models that will interact with the MongoDB database for CRUD operations.
 * 
 * @module models
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Schema definition for the "movie" collection.
 * @type {mongoose.Schema}
 */
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: Number,
        Death: Number
    },
    ImagePath: String,
    Featured: Boolean
});
  
/**
 * Schema definition for the "user" collection.
 * @type {mongoose.Schema}
 */
let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    birthday: {type: Date, required: true},
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movie' }]
});

/**
 * Hashes a password.
 * 
 * Uses bcrypt to securely hash a password before saving it to the database.
 * @function hashPassword
 * @param {string} password - The password to hash.
 * @returns {string} The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};
  
  /**
 * Validates a given password against the stored hash.
 * 
 * This is an instance method on the user model to check if the provided password
 * matches the hashed password stored in the database.
 * @function validatePassword
 * @param {string} password - The password to validate.
 * @returns {boolean} A boolean indicating if the password is valid.
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
  
/**
 * Movie model based on the movieSchema.
 * @type {mongoose.Model}
 */
let Movie = mongoose.model('movie', movieSchema);

/**
 * User model based on the userSchema.
 * @type {mongoose.Model}
 */
let User = mongoose.model('user', userSchema);
  
module.exports.Movie = Movie;
module.exports.User = User;