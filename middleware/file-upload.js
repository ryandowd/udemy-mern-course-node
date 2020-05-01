const multer = require("multer");
const uuid = require("uuid/v1");

// This is a simple JS object which we will map
// certain MIME types to different file extensions.
// Multer is what gives the file the MIME type.
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// NOTE: Here we create middleware, and we can now have
// this file to adjust the middleware in a global place.

// NOTE: This line below is the middleware.
// Actually it is a group of middlewares which we can
// use to fuck around with the file and check things.
const fileUpload = multer({
  // When the file comes in and is taken from the incomgin request
  // then we can do things with it.

  // Here we set a file size limit
  limits: 500000,
  // Here we add where to 'store' the image. And Multer has a built
  // in disk storage driver. This will generate the driver.
  storage: multer.diskStorage({
    // So here we can set the destination
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    // And the filename
    filename: (req, file, cb) => {
      // get the mimetype
      const ext = MIME_TYPE_MAP[file.mimetype];
      // cb is the 'callback'
      // NOTE: This creates the filename and passes it
      // back to Multer
      cb(null, uuid() + "." + ext);
    },
  }),
  // Here we do some file checking to make sure the user isn't
  // being malicious and uploading the wrong files by hacking the FE.
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

// export the middleware
module.exports = fileUpload;
