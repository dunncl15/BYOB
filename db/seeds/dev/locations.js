
exports.seed = function(knex, Promise) {
  return knex('parks').del()
    .then(() => knex('locations').del())
    .then(() => {
      return Promise.all([
        data.forEach(location => {
          knex('locations').insert({
            city: location.city
          }, 'id')
          .then(location => {
            data.forEach(location => {
              return knex('parks').insert([
                { place_id: location[0],
                  name: location.activities[0].name,
                  activity_type: location.activities[0].activity_type_name,
                  activity_description: location.activities[0].description,
                }
              ])
            })
          })
        })
      ])
    });
};
