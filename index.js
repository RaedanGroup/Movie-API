// set requires and constants
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

// mongoose and models.js require
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movie = Models.Movie;
const User = Models.User;

// mongoose connection
mongoose.connect('mongodb://localhost:27017/movieAPI')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// use body-parser
app.use(bodyParser.json());

// use auth.js
let auth = require('./auth')(app);

// use passport
const passport = require('passport');
require('./passport');

// log all requests
app.use(morgan('common'));

// CREATE endpoints
// POST new user
app.post('/users', async (req, res) => {
  try {
    const { username } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // If the username already exists, send a 409 Conflict response
      return res.status(409).send('Username already in use.');
    }

    // If the username is not already in use, create and save the new user
    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    // Send a 201 Created response with the created user object
    res.status(201).json(savedUser);
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).send('Internal Server Error');
  }
});


// UPDATE endpoints
// PUT user info update
app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {

  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
  }

  const { username } = req.params;
  const updatedUser = req.body;

  await User.findOne({ username })
    .then(user => {
      if (!user) {
        return res.status(404).send('User not found.');
      }

      user.username = updatedUser.username;

      return user.save();
    })
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => res.status(400).send(err.message));
});


// PUT add movie to user's favorites
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
// DELETE movie from user's favorites
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




// DELETE user
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
// GET all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movie.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(400).send(err.message));
});

// GET all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await User.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(400).send(err.message));
});

// GET data about a single movie by title
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

// GET genre data by name
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { genreName } = req.params;

  await Movie.findOne({ 'Genre.Name': genreName })
    .select('Genre') // Only select the 'Genre' field
    .then(genre => {
      if (!genre) {
        return res.status(404).send('Genre not found.');
      }
      res.status(200).json(genre);
    })
    .catch(err => res.status(400).send(err.message));
});


// GET director data by name
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { directorName } = req.params;

  await Movie.findOne({ 'Director.Name': directorName })
    .select('Director') // Only select the 'Director' field
    .then(director => {
      if (!director) {
        return res.status(404).send('Director not found.');
      }
      res.status(200).json(director);
    })
    .catch(err => res.status(400).send(err.message));
});


app.listen(8080, () => console.log('App is listening on port 8080.'));
