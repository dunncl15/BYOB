const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000)

app.get('/', (request, response) => {
  response.status(404).send({ error: 'Route not found.' })
})

app.get('/api/v1/locations', (request, response) => {
  const { url } = request;
  database('locations').select()
  .then(locations => {
    if (url !== '/api/v1/locations/') {
      response.status(400).send({ error: 'Invalid request url.' })
    } else {
      response.status(200).json(locations);
    }
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.get('/api/v1/locations/:id', (request, response) => {
  const { id } = request.params;
  database('locations').where('id', id).select()
  .then(location => {
    if (!location.length) {
      response.status(404).send({ error: 'Location not found.' })
    } else {
      response.status(200).json(location)
    }
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.get('/api/v1/parks', (request, response) => {
  database('parks').select()
  .then(parks => {
    response.status(200).json(parks)
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.get('/api/v1/parks/:id', (request, response) => {
  const { id } = request.params;
  database('parks').where('id', id).select()
  .then(park => {
    if (!park.length) {
      response.status(404).send({ error: 'Park not found.' })
    } else {
      response.status(200).json(park)
    }
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.get('/api/v1/locations/:id/parks', (request, response) => {
  const { id } = request.params;
  database('parks').where('city_id', id).select()
  .then(parks => {
    if (!parks.length) {
      response.status(404).send({ error: 'Park not found' })
    }
    response.status(200).json(parks)
  })
  .catch(error => response.status(500).send({ error: error }));
})


app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}.`);
});

module.exports = app;
