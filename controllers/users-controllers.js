const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const getAllUsers = async (req, res, next) => {
  let users;

  try {
    // NOTE: The following use of '-password' is a command
    // to remove a certain field from the returned response
    // data (in this case the 'password'). It uses a minus
    // symbol to define that it needs to be removed. An
    // alternative to this is to just add the fields that you
    // want to be returned
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(err.toString(), 500);
    return next(error);
  }

  res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 442)
    );
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    // NOTE: 'findOne()' only returns one document with the matching details
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(err.toString(), 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://images.unsplash.com/photo-1508280756091-9bdd7ef1f463?ixlib=rb-1.2.1&w=1000&q=80",
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(err.toString(), 500);
    return next(error);
  }

  res.status(201).json({
    user: createdUser.toObject({ getters: true }),
  });
};

const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 442)
    );
  }
  const { email, password } = req.body;

  let existingUser;

  // Validate email
  try {
    // NOTE: 'findOne()' only returns one document with the matching details
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(err.toString(), 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("Invalid credentials.", 401);
    return next(error);
  }

  res.json({
    message: `${existingUser.name} has logged in`,
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getAllUsers = getAllUsers;
exports.signupUser = signupUser;
exports.loginUser = loginUser;
