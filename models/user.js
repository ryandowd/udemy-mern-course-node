const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  // NOTE: 'unique: true' causes mongoose to create an internal
  // index for the email, and this makes it easier/faster for it to
  // be searched for.
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true },
});

// Further to setting 'unique' (to make the email faster to)
// search for, we also pass the schema through a 'uniqueValidator'
// which allows us to make sure that the email is unique
userSchema.plugin(uniqueValidator);

// The convention for naming a collection is to use a
// singular form, and have an uppercase first letter.
// Mongoose then creates the collection by making this
// a plural for the colleciton name.
module.exports = mongoose.model("User", userSchema);
