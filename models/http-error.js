class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Add a "message" property to instances based on this class
    this.code = errorCode; // Add a "code" property to instances based on this class
  }
}

module.exports = HttpError;
