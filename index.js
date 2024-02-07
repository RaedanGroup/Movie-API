// set requires and constants
const express = require('express'),
  app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

// use body-parser
app.use(bodyParser.json());

// log all requests
app.use(morgan('common'));

// static array of 2 demo users
let users = [
  {
    id: 1,
    name: 'Argos Stone',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Phaelan Mace',
    favoriteMovies: ["The Third Man"]
  },
]

// json object of 3 demo movies
let movies = [
  {
    "Title": 'The Third Man',
    "Year": 1949,
    "Description": 'Pulp novelist Holly Martins travels to shadowy, postwar Vienna, only to find himself investigating the mysterious death of an old friend, Harry Lime.',
    "Genre": {
      "Name": "Film Noir",
      "Description": "Film noir is a cinematic term used primarily to describe stylish Hollywood crime dramas, particularly those that emphasize cynical attitudes and nebulous scenarios."
    },
    "Director": {
      "Name": "Carol Reed",
      "Bio": "Sir Carol Reed was an English film director, producer and screenwriter. He was knighted in 1952 for his contribution to the film industry.",
      "Birth": 1906
    },
  },
  {
    "Title": 'Chinatown',
    "Year": 1974,
    "Description": 'A private detective hired to expose an adulterer finds himself caught up in a web of deceit and corruption.',
    "Genre": {
      "Name": "Mystery",
      "Description": "Mystery films are a genre of film that revolves around the solution of a problem or a crime."
    },
    "Director": {
      "Name": "Roman Polanski",
      "Bio": "Roman Polanski is a Polish-French film director, producer, writer, and actor.",
      "Birth": 1933
    },
  },
  {
    "Title": 'Blade Runner',
    "Year": 1982,
    "Description": 'A blade runner must pursue and terminate four replicants who stole a ship in space, and have returned to Earth to find their creator.',
    "Genre": {
      "Name": "Sci-Fi",
      "Description": "Science fiction (sometimes shortened to sci-fi or SF) is a genre of speculative fiction that typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life."
    },
    "Director": {
      "Name": "Ridley Scott",
      "Bio": "Sir Ridley Scott is an English film director and producer.",
      "Birth": 1937
    },
  }
]

// CREATE endpoints
// POST new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('Name is required.');
  }
});

// UPDATE endpoints
// PUT user info update
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('User not found.');
  }
});

// PUT add movie to user's favorites
app.put('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} added to ${user.name}'s favorites.`);
  } else {
    res.status(400).send('User not found.');
  }
});

// DELETE endpoints
// DELETE movie from user's favorites
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} removed from ${user.name}'s favorites.`);
  } else {
    res.status(400).send('User not found.');
  }
});

// DELETE user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`${user.name} deleted.`);
  } else {
    res.status(400).send('User not found.');
  }
});

// READ endpoints
// GET all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// GET data about a single movie by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('Movie not found.');
  }
});

// GET genre data by name
app.get('/movies/genres/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('Genre not found.');
  }
});

// GET director data by name
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('Director not found.');
  }
});


app.listen(8080, () => console.log('App is listening on port 8080.'));