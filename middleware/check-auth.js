const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const privateKey = process.env.JWT_KEY || "supersecret_dont_share";

module.exports = (req, res, next) => {
  // NOTE: Here we need to allow the request to continue (i.e. return next())
  // when the request has a request method of 'OPTIONS'. Options is essentially just
  // a browser behaviour. I.e. For certain http (CRUD) words, the browser first sends
  // and 'OPTIONS' request to first check if the server will permit the next request. Weird.
  if (req.method === "OPTIONS") {
    return next();
  }
  // NOTE: There are a few (bad) options available to add the token on the request.
  // For example - through a query param, or on the request body - but both of these
  // ways aren't ideal. The best way is to send it in the headers because it is essentially
  // meta data.
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer Token
    if (!token) {
      throw new Error("Auth failed!");
    }
    // IF there is a token, then we use the private key to check it and verify if its valid
    const decodedToken = jwt.verify(token, privateKey);
    // Now we attach 'userData' to the req object. And from now on this 'userData'
    // object will exist on the req object and can be used by subsequent middleware
    req.userData = { userId: decodedToken.userId };
    // Now we call next() so that the route can continue its journey.
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};
