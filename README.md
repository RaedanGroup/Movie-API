# Percy's Picks API Documentation
Welcome to Percy's Picks API documentation. Below you'll find details about each endpoint available in the API.

# User Endpoints
## Create a New User
Create a new user account.

URL: /users  
Method: POST  
Request Body:  
```
  username (string, required): The username for the new user.  
  password (string, required): The password for the new user.  
  email (string, required): The email address for the new user.  
  birthday (string, required): The birthday of the new user in the format YYYY-MM-DD.
```
Response: The created user object with status code 201.  

## User Login
Authenticate user and generate JWT token.

URL: /login  
Method: POST  
Request Body:  
```
  username (string, required): The username of the user.  
  password (string, required): The password of the user.
```
Response: JWT token with status code 200.

## Update User Account
Update user account information.

URL: /users/:username  
Method: PUT  
Request Parameters: Fields to be updated
```
  username (string): The new username for the user.  
  password (string): The new password for the user.  
  email (string): The new email address for the user.  
  birthday (string): The new birthday of the user in the format YYYY-MM-DD.
```
Response: The updated user object with status code 200.  

## Delete User Account
Delete a user account.

URL: /users/:username  
Method: DELETE  
Request Parameters:  
```
  username (string, required): The username of the user to be deleted.
```
Response: Confirmation message with status code 200.

## Get All Users
Retrieve a list of all users.

URL: /users  
Method: GET  
Response: A list of user objects with status code 200.  

## Add Movie to Favorites
Add a movie to a user's list of favorite movies.

URL: /users/:username/favorite/:title  
Method: PUT  
Request Parameters:  
```
  username (string, required): The username of the user.  
  title (string, required): The title of the movie to add to favorites.
```
Response: Confirmation message with status code 200.

## Remove Movie from Favorites
Remove a movie from a user's list of favorite movies.

URL: /users/:username/favorite/:title  
Method: DELETE  
Request Parameters:  
```
  username (string, required): The username of the user.  
  title (string, required): The title of the movie to remove from favorites.
```
Response: Confirmation message with status code 200.

## Get All Movies
Retrieve a list of all movies.

URL: /movies  
Method: GET  
Response: A list of movie objects with status code 200.

## Get Data About a Single Movie
Retrieve details about a specific movie by its title.

URL: /movies/:title  
Method: GET  
Request Parameters:  
```
  title (string, required): The title of the movie.
```
Response: Details of the movie with status code 200.

## Get Genre Data by Name
Retrieve details about a genre by its name.

URL: /movies/genres/:genreName
Method: GET
Request Parameters:
```
genreName (string, required): The name of the genre.
```
Response: Details of the genre with status code 200.

## Get Director Data by Name
Retrieve details about a director by their name.

URL: /movies/directors/:directorName
Method: GET
Request Parameters:
```
directorName (string, required): The name of the director.
```
Response: Details of the director with status code 200.
