const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Utils
const HttpError = require("../models/http-error");
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

  let hashedPassword;
  // NOTE: '12' is the number of 'salting rounds'.
  // i.e. amount of times the hashing will run
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(err.toString(), 500);
    return next(error);
  }

  let token;
  try {
    // NOTE: We create a 'signed' token with '.sign()'
    token = jwt.sign(
      // Then we pass in the object we want to store
      { userId: createdUser.id, email: createdUser.email },
      // Then we add a 'private key'. This key will never be know on the clent sign.
      // It will only exist in the server side and therefore cannot be found by a user.
      // It is the string that is used to encrypt and decrypt the token. Thus the token
      // can never be replicated or faked because the key is never on the FE.
      process.env.JWT_KEY,
      // We can also add a expiration time
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(err.toString(), 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    // NOTE: We pass the token back to the FE
    token: token,
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

  if (!existingUser) {
    const error = new HttpError("Invalid credentials.", 403);
    return next(error);
  }

  // Validate passord
  let isValidPassword = false;
  // NOTE: We can use bcrypt.compare() method because bcrypt knows if a hash
  // and the plain text password from the request match.
  // I don't know how it does this. This func uses a promise and returns a boolean.
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Invalid credentials.", 403);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials.", 403);
    return next(error);
  }

  let token;
  try {
    // NOTE: We create a 'signed' token with '.sign()'
    token = jwt.sign(
      // Then we pass in the object we want to store
      { userId: existingUser.id, email: existingUser.email },
      // NOTE: On the 'login' process, we want to use the same private key
      // because if the user signs in a makes a request we want to be able to
      // validate them on the server
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(err.toString(), 500);
    return next(error);
  }

  res.json({
    message: `${existingUser.name} has logged in`,
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.getAllUsers = getAllUsers;
exports.signupUser = signupUser;
exports.loginUser = loginUser;
