const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // NOTE: The 'type: mongoose.Types.ObjectId' is used to
  // generate a mongoose ID for the creator. While the 'ref' of 'User
  // is added so that the place will reference the User model. This
  // allows us to use the many-to-one pattern of DB structure.
  // This sets up the relationship.
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

// The convention for naming a collection is to use a
// singular form, and have an uppercase first letter.
// Mongoose then creates the collection by making this
// a plural for the colleciton name.
module.exports = mongoose.model("Place", placeSchema);
