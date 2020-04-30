const express = require("express");
const { check } = require("express-validator");
const usersControllers = require("../controllers/users-controllers");
const router = express.Router();

router.get("/", usersControllers.getAllUsers);

router.post(
  "/signup",
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
  usersControllers.signupUser
);

router.post("/login", usersControllers.loginUser);

module.exports = router;
