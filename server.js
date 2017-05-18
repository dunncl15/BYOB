const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config = require('dotenv').config().parsed;

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.set('secretKey', config.CLIENT_SECRET);
let token = jwt.sign('token', app.get('secretKey'));
console.log(token);

if (!config.CLIENT_SECRET || !config.USERNAME || !config.PASSWORD) {
  throw 'Make sure you have a CLIENT_SECRET, USERNAME, and PASSWORD in your .env file'
}

const checkAuth = (request, response, next) => {
  const token = request.body.token ||
                request.param('token') ||
                request.headers['authorization'];

  if (token) {
    jwt.verify(token, app.get('secretKey'), (error, decoded) => {
    if (error) {
      return response.status(403).send({
        success: false,
        message: 'Invalid authorization token.'
      });
    } else {
      request.decoded = decoded;
      next();
      }
    })
  } else {
    return response.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint'
    });
  }
}


app.set('port', process.env.PORT || 3000);

app.get('/', (request, response) => {
  response.status(404).send({ error: 'Route not found.' })
})

app.get('/api/v1/locations', (request, response) => {
  database('locations').select()
  .then(locations => {
    response.status(200).json(locations);
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

app.post('/api/v1/locations', checkAuth, (request, response) => {
  const location = request.body;
  database('locations').insert(location, 'id')
  .then(location => {
    response.status(201).json({ id: location[0] })
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.post('/api/v1/parks', checkAuth, (request, response) => {
  const park = request.body;
  database('parks').insert(park, 'id')
  .then(park => {
    response.status(201).json({ id: park[0] })
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}.`);
});

module.exports = app;
