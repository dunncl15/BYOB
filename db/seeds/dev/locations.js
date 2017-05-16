const data = require('../../../data_cleaner.js');
console.log(data);

exports.seed = function(knex, Promise) {
  return knex('parks').del()
    .then(() => knex('locations').del())
    .then(() => {
      return Promise.all([
        data.forEach(place => {
          knex('locations').insert({
            city: place.city
          }, 'id')
          .then(place => {
            return knex('parks').insert(
              { city_id: location[0],
                name: place.activities[0].name,
                activity_type: place.activities[0].activity_type_name,
                activity_description: place.activities[0].description,
              }
            )
          })
        })
      ])
    });
}
