const express = require("express");
const { check } = require("express-validator");
const usersControllers = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");
const router = express.Router();

router.get("/", usersControllers.getAllUsers);

router.post(
  "/signup",
  // Here we add the middleware into the incoming request
  // NOTE: We use the 'single()' multer command to say that we
  // are getting a single image. This will extract the image from
  // the incoming request. We use the value of 'image' because
  // that is the value key that the image data will be send in.
  fileUpload.single("image"),
  [
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 chars long")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email address"),
    check("name").not().isEmpty().trim().withMessage("Name must not be empty"),
  ],
  usersControllers.signupUser
);

router.post("/login", usersControllers.loginUser);

module.exports = router;
