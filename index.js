/**
 * The main entry point for the application.
 * 
 * This script sets up an Express application, connects to MongoDB, defines API endpoints,
 * and includes configuration for CORS, logging, and authentication using Passport and JWT.
 */

const express = require('express');
const app = express();
const morgan = require('morgan'); // HTTP request logger middleware
const bodyParser = require('body-parser'); // Parse incoming request bodies in a middleware
const uuid = require('uuid'); // For generating unique identifiers
const path = require('path'); // Provides utilities for working with file and directory paths

const mongoose = require('mongoose'); // ODM library for MongoDB
const Models = require('./models.js'); // Import schemas and models

const Movie = Models.Movie; // Destructure Movie model
const User = Models.User; // Destructure User model

const bcrypt = require('bcrypt'); // Library for hashing passwords

const { check, validationResult } = require('express-validator'); // Validation and sanitization middleware

// mongoose connection
mongoose.connect(process.env.CONNECTION_URI) // Connection URI from environment variable
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// CORS configuration
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'http://localhost:4200' , 'https://percyspicks.netlify.app' , 'https://raedangroup.github.io'];

app.use(cors({
  origin: (origin, callback) => {
    // Check if origin is allowed
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

// Passport.js authentication
let auth = require('./auth')(app); // Import and initialize authentication module
const passport = require('passport');
require('./passport'); // Passport strategies

// Morgan logging middleware
app.use(morgan('common'));

/**
 * Validation middleware for new user registration.
 */
const validateUser = [
  check('username').isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
  check('username').isAlphanumeric().withMessage('Username can only contain alphanumeric characters'),
  check('password').notEmpty().withMessage('Password is required'),
  check('email').isEmail().withMessage('Email is not valid')
];

// POST endpoint to register a new user
app.post('/users', validateUser, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Destructure the request body
    const { username, password, email, birthday } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).send('Username already in use.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser = new User({ username, password: hashedPassword, email, birthday });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Send a 201 Created response with the created user object
    res.status(201).json(savedUser);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(({ message }) => message);
      return res.status(422).json({ errors });
    }
    // Handle other unexpected errors
    res.status(500).send('Internal Server Error');
  }
});

// UPDATE endpoints
// PUT endpoint to update user information
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [
  check('username', 'Username is required').isLength({ min: 5 }),
  check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').optional().notEmpty(), // Make password optional
  check('email', 'Email does not appear to be valid').optional().isEmail(), // Make email optional
  check('birthday', 'Birthday is required').optional().notEmpty(), // Make birthday optional
], async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Extract updated user data from request body
  const { username } = req.params;
  const updatedUser = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // If user not found, return 404
    if (!user) {
      return res.status(404).send('User not found.');
    }

    // Update user fields if provided
    if (updatedUser.username) {
      user.username = updatedUser.username;
    }
    if (updatedUser.password) {
      // Hash the new password
      user.password = await User.hashPassword(updatedUser.password);
    }
    if (updatedUser.email) {
      user.email = updatedUser.email;
    }
    if (updatedUser.birthday) {
      user.birthday = updatedUser.birthday;
    }

    // Save the updated user
    const savedUser = await user.save();

    // Respond with the updated user
    res.status(200).json(savedUser);
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).send('Internal Server Error');
  }
});

// PUT endpoint to add a movie to a user's favorite list
app.put('/users/:username/favorite/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {

  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
}

  const { username, title } = req.params;

  await User.findOne({ username })
    .then(user => {
      if (!user) {
        return res.status(404).send('User not found.');
      }
      Movie.findOne({ Title: title })
        .then(movie => {
          if (!movie) {
            return res.status(404).send('Movie not found.');
          }
          user.favoriteMovies.push(movie._id);
          return user.save();
        })
        .then(() => {
          res.status(200).send(`${title} has been added to ${username}'s favorites.`);
        })
        .catch(err => res.status(400).send(err.message));
    })
    .catch(err => res.status(400).send(err.message));
});

// DELETE endpoints
// DELETE endpoint to remove a movie from a user's favorite list
app.delete('/users/:username/favorite/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {

  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
}

  const { username, title } = req.params;

  await User.findOne({ username })
    .then(user => {
      if (!user) {
        return res.status(404).send('User not found.');
      }

      // Find the movie by title
      Movie.findOne({ Title: title })
        .then(movie => {
          if (!movie) {
            return res.status(404).send('Movie not found.');
          }

          // Find the index of the movie _id in the user's favoriteMovies array
          const index = user.favoriteMovies.indexOf(movie._id);

          // If the movie is not in the user's favorites, return 404
          if (index === -1) {
            return res.status(404).send(`${title} is not in ${username}'s favorites.`);
          }

          // Remove the movie _id from the user's favoriteMovies array
          user.favoriteMovies.splice(index, 1);

          // Save the updated user document
          return user.save();
        })
        .then(() => {
          // Respond with success message
          res.status(200).send(`${title} has been removed from ${username}'s favorites.`);
        })
        .catch(err => res.status(400).send(err.message));
    })
    .catch(err => res.status(400).send(err.message));
});

// DELETE endpoint to delete a user
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {

  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
}

  const { username } = req.params;

  await User.findOneAndDelete({ username })
    .then(user => {
      if (!user) {
        return res.status(404).send('User not found.');
      }
      res.status(200).send(`Account for ${user.email} has been deleted.`);
    })
    .catch(err => res.status(400).send(err.message));
});

// READ endpoints
// GET index.html
// Define the path to the index.html file
const indexPath = path.join(__dirname, 'index.html');

// Define the endpoint for '/'
app.get('/', (req, res) => {
  // Send the index.html file
  res.sendFile(indexPath);
});

// GET endpoint to return all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movie.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(400).send(err.message));
});

// GET endpoint to return a single movie by title
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await User.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(400).send(err.message));
});

// GET endpoint to return a single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { title } = req.params;

  await Movie.findOne({ Title: title })
    .then(movie => {
      if (!movie) {
        return res.status(404).send('Movie not found.');
      }
      res.status(200).json(movie);
    })
    .catch(err => res.status(400).send(err.message));
});

// GET endpoint to return genre data by name
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { genreName } = req.params;

  await Movie.findOne({ 'Genre.Name': genreName })
    .select('Genre -_id') // Only select the 'Genre' field
    .then(genre => {
      if (!genre) {
        return res.status(404).send('Genre not found.');
      }
      res.status(200).json(genre);
    })
    .catch(err => res.status(400).send(err.message));
});

// GET endpoint to return director data by name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { directorName } = req.params;

  await Movie.findOne({ 'Director.Name': directorName })
    .select('Director -_id') // Only select the 'Director' field
    .then(director => {
      if (!director) {
        return res.status(404).send('Director not found.');
      }
      res.status(200).json(director);
    })
    .catch(err => res.status(400).send(err.message));
});

/**
 * Starts the server on the specified port.
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
