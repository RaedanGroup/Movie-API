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

// log all requests
app.use(morgan('common'));

// CREATE endpoints
// POST new user
app.post('/users', (req, res) => {
  const newUser = new User(req.body);

  newUser.save()
    .then(user => res.status(201).json(user))
    .catch(err => res.status(400).send(err.message));
});

// UPDATE endpoints
// PUT user info update
app.put('/users/:username', (req, res) => {
  const { username } = req.params;
  const updatedUser = req.body;

  User.findOne({ username })
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
app.put('/users/:username/favorite/:title', (req, res) => {
  const { username, title } = req.params;

  User.findOne({ username })
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
app.delete('/users/:username/favorite/:title', (req, res) => {
  const { username, title } = req.params;

  User.findOne({ username })
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
app.delete('/users/:username', (req, res) => {
  const { username } = req.params;

  User.findOneAndDelete({ username })
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
app.get('/movies', (req, res) => {
  Movie.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(400).send(err.message));
});

// GET all users
app.get('/users', (req, res) => {
  User.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(400).send(err.message));
});

// GET data about a single movie by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;

  Movie.findOne({ Title: title })
    .then(movie => {
      if (!movie) {
        return res.status(404).send('Movie not found.');
      }
      res.status(200).json(movie);
    })
    .catch(err => res.status(400).send(err.message));
});

// GET genre data by name
app.get('/movies/genres/:genreName', (req, res) => {
  const { genreName } = req.params;

  Movie.findOne({ 'Genre.Name': genreName })
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
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;

  Movie.findOne({ 'Director.Name': directorName })
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
