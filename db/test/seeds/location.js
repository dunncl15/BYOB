exports.seed = function(knex, Promise) {
  return knex('parks').del()
    .then(() => knex('locations').del())
    .then(() =>  {
      return Promise.all([
        knex('locations').insert({
          city: 'Breckenridge',
          id: 1
        }, 'id')
        .then(location => {
          return knex('parks').insert([
            { name: 'Mt. Quandry',
              activity_type: 'hiking',
              activity_description: 'Summit a 14er.',
              city_id: location[0],
              id: 10
            },
            { name: 'Hoosier Pass',
              activity_type: 'hiking',
              activity_description: 'Great views of Breckenridge',
              city_id: location[0],
              id: 11
            },
            { name: 'City park',
              activity_type: 'walking',
              activity_description: 'Town center park',
              city_id: location[0],
              id: 12
            }
          ])
        }),
        knex('locations').insert({
          city: 'Denver',
          id: 2
        }, 'id')
        .then(location => {
          return knex('parks').insert([
            { name: 'Washington Park',
              activity_type: 'walking, running',
              activity_description: 'City park',
              city_id: location[0],
              id: 13
            },
            { name: 'Cherry Creek Trail',
              activity_type: 'biking',
              activity_description: 'Great biking trail along the Cherry Creek.',
              city_id: location[0],
              id: 14
            }
          ])
        }),
        knex('locations').insert({
          city: 'Boulder',
          id: 3
        }, 'id')
      ]); // end Promise.all
    });
};
