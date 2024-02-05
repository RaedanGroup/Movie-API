// require express and morgan
const express = require('express');
    const morgan = require('morgan');

// set express to variable app
const app = express();

// Log all requests
app.use(morgan('common'));

  // json object with data about 10 movies
  let topTenMovies = [
    {"title": "Blade Runner", "director": "Ridley Scott"},
    {"title": "Chinatown", "director": "Roman Polanski"},
    {"title": "Dark Passage", "director": "Delmer Daves"},
    {"title": "Double Indemnity", "director": "Billy Wilder"},
    {"title": "Le Samourai", "director": "Jean-Pierre Melville"},
    {"title": "Out of the Past", "director": "Jacques Tourneur"},
    {"title": "Reminiscence", "director": "Lisa Joy"},
    {"title": "Shutter Island", "director": "Martin Scorsese"},
    {"title": "The Maltese Falcon", "director": "John Huston"},
    {"title": "The Third Man", "director": "Carol Reed"}
  ];

// '/' returns text response
app.get('/', (req, res) => {
    res.send('Like the fella says, in Italy for 30 years under the Borgias they had warfare, terror, murder, and bloodshed, <br>but they produced Michelangelo, Leonardo da Vinci, and the Renaissance. <br><br>In Switzerland they had brotherly love - they had 500 years of democracy and peace, and what did that produce?<br>The cuckoo clock.<br><br>Harry Lime (The Third Man)');
});
  
// '/movies' returns json object with data about 10 movies
app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});

// use express.static to serve "documentation.html" from the public folder when the /documentation route is requested
app.use('/documentation', express.static('public', {index: 'documentation.html'}));
  
// Log all application-level errors to the terminal
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });