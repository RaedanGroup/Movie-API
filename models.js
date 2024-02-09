const mongoose = require('mongoose');

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
  
let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    birthday: {type: Date, required: true},
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movie' }]
});
  
let Movie = mongoose.model('movie', movieSchema);
let User = mongoose.model('user', userSchema);
  
module.exports.Movie = Movie;
module.exports.User = User;