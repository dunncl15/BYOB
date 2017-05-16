const rawData = require('./recreation.json');

const places = [];

const data = rawData.places.reduce((acc, location) => {
  let city = location.city;
  if (!acc[city]) {
    acc[city] = 1;
    places.push(location)
  }
  return acc;
}, {});

module.exports = places;
