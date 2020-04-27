const HttpError = require("../models/http-error");
const uuid = require("uuid/v4");

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "New Malden",
    description: "This is new malden",
    location: {
      lat: 40.748,
      lng: -73.987,
    },
    address: "15 Effort Street",
    creator: "u1",
  },
];

const getPlaceByPlaceId = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    // Using the 'next()' func when there
    // is no 'place' found will essentially pass an
    // error down the line to be picked up by anything
    // i.e. 'app.use(error...)' in the app.js file.
    // Also, we use 'next()' so that it will work with asyncronous code
    return next(
      new HttpError("Could not find a place for the provided place ID", 404)
    );
  }

  res.json({
    place,
  });
};

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });

  if (!place) {
    // Using the 'next()' func when there
    // is no 'place' found will essentially pass an
    // error down the line to be picked up by anything
    // i.e. 'app.use(error...)' in the app.js file.
    // Also, we use 'next()' so that it will work with asyncronous code
    return next(
      new HttpError("Could not find a place for the provided user ID", 404)
    );
  }

  res.json({
    place,
  });
};

const createPlace = (req, res, next) => {
  // Because we are using the 'bodyParser' middleware in app.js
  // we can now destructure these vars from JSON data being received
  // on the request
  const { title, description, coordinates, address, creator } = req.body;
  // NOTE: Below we set values. But notice the shorthand code, that only location is set to
  // coordinates, with the rest having no value set. But this is because
  // JS allows us to set a value to it's key without the : semicolon
  // ONLY WHEN the name of the value and the variable of the value are the same.
  const createPlace = {
    id: uuid(),
    title: title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createPlace); /// unshift(createdPlace)
  res.status(201).json({ place: createPlace });
};

exports.getPlaceByPlaceId = getPlaceByPlaceId;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
