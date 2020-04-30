const express = require("express");
const { check } = require("express-validator");
const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceByPlaceId);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

// NOTE: Here, we can see how you can add multiple middlewares on a path
// and they get passed through from left to right. So in the below example,
// the 'check()' func will be run before the placeControllers middleware.
// Keep in mind that adding these 'check's alone wont do the validation
router.post(
  "/",
  check("title").not().isEmpty().trim().withMessage("Title must not be empty"),
  check("description")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Description must not be empty"),
  check("address")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Address must not be empty"),
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
