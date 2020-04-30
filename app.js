const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url =
  "mongodb+srv://ryand:ryand123@cluster0-oustz.mongodb.net/places_app?retryWrites=true&w=majority";

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

// Adding more middleware to parse the body of POST requests
// This allows us to easily get query params that have been passed.
// It does this by parsing any incoming requests and extract any json
// data that is stored in it. Another option is 'urlencoded' data but
// in this case we are passing data in via JSON.
app.use(bodyParser.json());

// Adding the places routes as middleware
app.use("/api/places", placesRoutes);
// Adding the users routes as middleware
app.use("/api/users", usersRoutes);

// This middleware code will only run if the above app.use()
// does not return a successful status of 201. Therefore, since it does not
// resolve then it will reach this. So these lines handle any erroneous routes
app.use((req, res, next) => {
  const error = new HttpError("Cound not find this route.", 404);
  throw error;
});

// Adding more middleware for handling errors.
// This will excecute if any code before it
// (i.e. the app.use() above, returns an error)
app.use((error, req, res, next) => {
  // If a response has already been sent
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(url)
  .then(() => {
    // Set the server to listen to port 5000
    app.listen(5000);
  })
  .catch((error) => {
    console.log("Connection error!");
  });
