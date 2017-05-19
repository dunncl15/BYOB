const rawData = require('../recreation.json');

const places = [];

rawData.places.reduce((acc, location) => {
  const city = location.city;
  if (!acc[city]) {
    acc[city] = 1;
    places.push(location);
  }
  return acc;
}, {});

module.exports = places;
