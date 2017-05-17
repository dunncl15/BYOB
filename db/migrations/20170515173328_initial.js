
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('locations', (table) => {
      table.increments('id').primary();
      table.string('city');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('parks', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('activity_type');
      table.text('activity_description');
      table.integer('city_id').unsigned();
      table.foreign('city_id')
           .references('locations.id');
      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('parks'),
    knex.schema.dropTable('locations')
  ]);
};
