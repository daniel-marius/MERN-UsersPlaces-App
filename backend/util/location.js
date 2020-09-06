const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEY = process.env.POSITIONSTACK_API_KEY || process.env.GOOGLE_GEOCODING_API_KEY;

// Using PositionStack API
async function getCoordsForAddress(address) {
  // return {
  //   lat: 40.7484474,
  //   lng: -73.9871516
  // };
  const response = await axios.get(
    `http://api.positionstack.com/v1/forward?access_key=${API_KEY}&query=${encodeURIComponent(address)}`
  );

  const { data: { data } } = response;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find location for the specified address.',
      422
    );
    throw error;
  }

  let coordinates;
  if (data[0].latitude && data[0].longitude) {
    coordinates = {
      'lat': data[0].latitude,
      'lng': data[0].longitude
    };
  }

  return coordinates;
};

// Using Google Geocoding API
// async function getCoordsForAddress(address) {
//   // return {
//   //   lat: 40.7484474,
//   //   lng: -73.9871516
//   // };
//   const response = await axios.get(
//     `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//       address
//     )}&key=${API_KEY}`
//   );
//
//   const data = response.data;
//
//   if (!data || data.status === 'ZERO_RESULTS') {
//     const error = new HttpError(
//       'Could not find location for the specified address.',
//       422
//     );
//     throw error;
//   }
//
//   const coordinates = data.results[0].geometry.location;
//
//   return coordinates;
// };

module.exports = getCoordsForAddress;
