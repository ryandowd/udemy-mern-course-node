const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceByPlaceId);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

// NOTE: Here we add middleware to make sure the user (i.e. the requests coming in)
// are using a valid web token. Ther two routes above this (i.e. 'GET /:pid' and 'GET /user/:uid')
// are both open to unauthoristed users. Therefore, since the routes are read top-to-bottom
// this line of middleware code will not be hit until after these two open routes. Also,
// because of this 'top-to-bottom' logic, any requests that DO NOT pass this token
// authorisation, will not be valid and therefore cannot pass to the next routes below this line.
router.use(checkAuth);

// NOTE: Here, we can see how you can add multiple middlewares on a path
// and they get passed through from left to right. So in the below example,
// the 'check()' func will be run before the placeControllers middleware.
// Keep in mind that adding these 'check's alone wont do the validation
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Title must not be empty"),
    check("description")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must not be empty"),
    check("address")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Address must not be empty"),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  check("title").not().isEmpty().trim().withMessage("Title must not be empty"),
  check("description")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Description must not be empty"),
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
