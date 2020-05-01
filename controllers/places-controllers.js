const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find place for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg", // => File Upload module, will be replaced with real image url
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

// const mongoose = require("mongoose");
// const HttpError = require("../models/http-error");
// const { validationResult } = require("express-validator");
// const getCoordsForAddress = require("../util/location");
// const Place = require("../models/place");
// const User = require("../models/user");

// const getPlaceByPlaceId = async (req, res, next) => {
//   const placeId = req.params.pid;
//   let place;

//   try {
//     place = await Place.findById(placeId);
//   } catch (err) {
//     const error = new HttpError(err.toString(), 500);
//     return next(error);
//   }

//   if (!place) {
//     return next(
//       new HttpError("Could not find a place for the provided place ID", 404)
//     );
//   }

//   res.json({
//     // NOTE: Using 'getters: true' tells mongoose to add the ID property
//     // to the object (because normally it just has the _id). So, instead, this
//     // just makes sure the object is passed back with an actual 'id' key/value
//     place: place.toObject({ getters: true }),
//   });
// };

// const getPlacesByUserId = async (req, res, next) => {
//   const userId = req.params.uid;
//   let userWithPlaces;

//   try {
//     userWithPlaces = await User.findById(userId).populate("places");
//   } catch (err) {
//     const error = new HttpError(err.toString(), 500);
//     return next(error);
//   }

//   if (!userWithPlaces.places || userWithPlaces.places.length === 0) {
//     return next(
//       new HttpError("Could not find any places for the provided user ID", 404)
//     );
//   }

//   res.json({
//     places: userWithPlaces.places.map((place) =>
//       place.toObject({ getters: true })
//     ),
//   });
// };

// const createPlace = async (req, res, next) => {
//   // NOTE: Here we are making sure to use 'next()' and to 'return'
//   // any validation errors. The reason we do this is to stop the
//   // code from continuing because, if it does, it will likely throw
//   // an error "Cannot set headers after they are sent to the client"
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return next(
//       new HttpError("Invalid inputs passed, please check your data", 442)
//     );
//   }

//   // Because we are using the 'bodyParser' middleware in app.js
//   // we can now destructure these vars from JSON data being received
//   // on the request.
//   const { title, description, address, creator } = req.body;

//   // The reason we use a TRY/CATCH is because
//   // the 'getCoordsForAddress' function will return a promise.
//   // And if it fails then the way we can handle that error is to
//   // wrap it in a try/catch.
//   let coordinates;
//   try {
//     coordinates = await getCoordsForAddress(address);
//   } catch (err) {
//     const error = new HttpError(err.toString(), 500);
//     return next(error);
//   }

//   const createdPlace = new Place({
//     title: title,
//     description,
//     address,
//     location: coordinates,
//     image:
//       "https://static.homesandproperty.co.uk/s3fs-public/styles/story_large/public/thumbnails/image/2015/11/25/13/620-new-malden-high-street.jpg",
//     creator,
//   });

//   let user;

//   try {
//     // Check if user is already existing
//     user = await User.findById(creator);
//   } catch (err) {
//     const error = new HttpError(err.toString(), 500);
//     return next(error);
//   }

//   if (!user) {
//     const error = new HttpError("Could not find user for provided ID", 404);
//     return next(error);
//   }

//   try {
//     // NOTE: The following uses 'sessions' and 'transactions'
//     // to allow us to add data to difference model instances
//     // AND IF THE ACTIONS fail at any time, then it cancels the session
//     // and doesn't make any of the updates at all.
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     // Passing through 'session' object allows us to tie actions to that session
//     await createdPlace.save({ session: session });
//     // NOTE: This use of 'push' is NOT the standard use of JS push().
//     // In this case, Mongoose has it's own push function which adds the place
//     // to the key of 'places' on the instance of the user (i.e. user.places).
//     // It does this behind the scenes and connects all the thingies.
//     user.places.push(createdPlace);
//     await user.save({ session: session });
//     await session.commitTransaction();
//   } catch (err) {
//     const error = new HttpError("Creating place failed, please try again", 500);
//     // Returning next(error) makes sure to exit the request when an error occurs
//     return next(error);
//   }

//   res.status(201).json({ place: createdPlace });
// };

// const updatePlace = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return next(
//       new HttpError("Invalid inputs passed, please check your data", 442)
//     );
//   }

//   const { title, description } = req.body;
//   const placeId = req.params.pid;
//   let place;

//   try {
//     place = await Place.findById(placeId);
//   } catch (err) {
//     const error = new HttpError(err.toString(), 500);
//     return next(error);
//   }

//   place.title = title;
//   place.description = description;

//   try {
//     await place.save();
//   } catch (err) {
//     const error = new HttpError(err.toString(), 500);
//     return next(error);
//   }

//   res.status(200).json({
//     place: place.toObject({ getters: true }),
//   });
// };

// const deletePlace = async (req, res, next) => {
//   const placeId = req.params.pid;
//   let place;
//   let user;

//   try {
//     // NOTE: Here we use 'populate' can take a value and
//     // use it to search through other collections and then
//     // we can return data from that document.
//     place = await (await Place.findById(placeId)).populate("creator");
//     console.log(place.creator, "place");
//   } catch (err) {
//     const error = new HttpError(err.toString(), 500);
//     return next(error);
//   }

//   if (!place) {
//     const error = new HttpError("Could not delete a place for this ID", 404);
//     return next(error);
//   }

//   try {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     await place.remove({ session: session });
//     // NOTE: This is where the magic of 'populate()' happens.
//     // So, by using the instance of 'place' we can access the User
//     // (via the 'creator' ID) to get the 'places' on the matching
//     // User instance. We can then access the data in that instance
//     place.creator.places.pull(place);
//     await place.creator.save({ session: session });
//     await session.commitTransaction();
//   } catch (err) {
//     const error = new HttpError(err.toString(), 500);
//     return next(error);
//   }

//   res.status(200).json({
//     message: "Place deleted",
//   });
// };

// exports.getPlaceByPlaceId = getPlaceByPlaceId;
// exports.getPlacesByUserId = getPlacesByUserId;
// exports.createPlace = createPlace;
// exports.updatePlace = updatePlace;
// exports.deletePlace = deletePlace;
