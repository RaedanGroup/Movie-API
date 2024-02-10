const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// hash the password before saving it to the database
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
  
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };
  
let Movie = mongoose.model('movie', movieSchema);
let User = mongoose.model('user', userSchema);
  
module.exports.Movie = Movie;
module.exports.User = User;