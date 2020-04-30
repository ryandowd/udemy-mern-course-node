const HttpError = require("../models/http-error");
// const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const User = require("../models/user");

// let DUMMY_USERS = [
//   {
//     id: uuidv4(),
//     name: "Ryan",
//     email: "r@r.com",
//     password: "33333",
//   },
//   {
//     id: uuidv4(),
//     name: "Kay",
//     email: "k@k.com",
//     password: "22222",
//   },
// ];

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

  // OLD LOGIC (Prior to Mongoose)
  // res.json({
  //   users: DUMMY_USERS,
  // });
};

const signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 442)
    );
  }

  const { name, email, password, places } = req.body;
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
    places,
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

  // OLD LOGIC (Prior to Mongoose)
  // const { name, email, password } = req.body;

  // const hasUser = DUMMY_USERS.find((user) => user.email === email);
  // if (hasUser) {
  //   return next(
  //     new HttpError(
  //       "Cannot create user. A user already exists with that email",
  //       422
  //     )
  //   );
  // }

  // const user = {
  //   id: uuidv4(),
  //   name,
  //   email,
  //   password,
  // };

  // DUMMY_USERS.push(user);

  // res.status(201).json({
  //   user,
  // });
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

  res.status(200).json({
    message: `${existingUser.name} has logged in`,
  });

  // OLD LOGIC (Prior to Mongoose)
  // if (typeof email === "undefined" || typeof password === "undefined") {
  //   return next(new HttpError("Email or password incorrect", 401));
  // }

  // const user = DUMMY_USERS.find((user) => {
  //   if (user.email === email && user.password === password) {
  //     return user;
  //   }
  // });

  // if (typeof user === "undefined") {
  //   return next(new HttpError("No user found with those credentials", 401));
  // }

  // res.status(200).json({
  //   message: `${user.name} has logged in`,
  // });
};

exports.getAllUsers = getAllUsers;
exports.signupUser = signupUser;
exports.loginUser = loginUser;
