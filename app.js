const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
//snake case to camel case conversion movie table
const convertSnakeCaseToCamelCaseOutput = (incomingObject) => {
  return {
    movieId: incomingObject.movie_id,
    directorId: incomingObject.director_id,
    movieName: incomingObject.movie_name,
    leadActor: incomingObject.lead_actor,
  };
};

// API-1 getting all movie names from movie table

app.get("/movies/", async (request, response) => {
  const getAllMovieQuery = `
    SELECT movie_name FROM movie`;
  const arrayOfMovieDetails = await db.all(getAllMovieQuery);
  let outputMovieArray = [];
  for (let eachObject of arrayOfMovieDetails) {
    outputMovieArray.push(convertSnakeCaseToCamelCaseOutput(eachObject));
  }
  response.send(outputMovieArray);
});

//API-2 creating new movie details in the movie table

app.post("/movies/", async (request, response) => {
  const movie_details = request.body;
  const { directorId, movieName, leadActor } = movie_details;
  const createQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES(
        '${directorId}',
        '${movieName}',
        '${leadActor}');`;
  const dbResponse = await db.run(createQuery);
  response.send("Movie Successfully Added");
});

//API-3 getting specific movie name based on movie_id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const specificMovieQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId}`;
  const movieObject = await db.get(specificMovieQuery);
  response.send(convertSnakeCaseToCamelCaseOutput(movieObject));
});

//API-4 updating existing movie details based on movie_id

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const update_details = request.body;
  const { directorId, movieName, leadActor } = update_details;
  const updateQuery = `
    UPDATE movie
    SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id=${movieId}`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//API-5 deleting specific movie(movie_id) from the movie table

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  deleteQuery = `
    DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//snake case to camel case conversion director table

const directorSnakeCaseToCamelCaseOutput = (directorObject) => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  };
};

//API-6 getting list of directors from director table

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT * FROM director`;
  const directorArrayDetails = await db.all(getDirectorQuery);
  let directorArray = [];
  for (let directorObject of directorArrayDetails) {
    directorArray.push(directorSnakeCaseToCamelCaseOutput(directorObject));
  }
  response.send(directorArray);
});

//API-7 getting all movies directed by directors based director id

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorIdMoviesQuery = `
    SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const arrayOfMovies = await db.all(getDirectorIdMoviesQuery);
  let outputMovieArray = [];
  for (let eachMovieObject of arrayOfMovies) {
    outputMovieArray.push(convertSnakeCaseToCamelCaseOutput(eachMovieObject));
  }
  response.send(outputMovieArray);
});

module.exports = app;
