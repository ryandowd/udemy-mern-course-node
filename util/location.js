const axios = require("axios");
const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyCGQH0Fnxn2RtuM1kLiNEnqYi1oqktvr9g";

const getCoordsForAddress = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address",
      422
    );
    // NOTE: If you throw an error inside an async function
    // then the promise that is made within that async function will
    // throw the error. No need for anything like next() etc
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
};

module.exports = getCoordsForAddress;
