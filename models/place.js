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
  creator: { type: String, required: true },
});

// The convention for naming a collection is to use a
// singular form, and have an uppercase first letter.
// Mongoose then creates the collection by making this
// a plural for the colleciton name.
module.exports = mongoose.model("Place", placeSchema);
