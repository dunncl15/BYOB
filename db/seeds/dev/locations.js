const data = require('../../../helpers/data_cleaner.js');

exports.seed = function(knex, Promise) {
  return knex('parks').del()
    .then(() => knex('locations').del())
    .then(() => {
      let localePromises = [];
      data.forEach(location => {
        localePromises.push(createLocation(knex, location));
      });
    })
    return Promise.all(localePromises);
}

const createLocation = (knex, location) => {
  return knex.table('locations')
    .returning('id')
    .insert(
      { city: location.city}
    )
    .then(cityIDs => {
      return knex('parks')
        .insert(
        { city_id: cityIDs[0],
          name: location.activities[0].name,
          activity_type: location.activities[0].activity_type_name,
          activity_description: location.activities[0].description,
        }
      );
    })
}
