const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('dotenv').config().parsed;
const checkAuth = require('./helpers/checkAuth');
const notFound = require('./helpers/errors')

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

if (process.env.NODE_ENV === 'development' && (!config.CLIENT_SECRET || !config.USERNAME || !config.PASSWORD)) {
  throw 'Make sure you have a CLIENT_SECRET, USERNAME, and PASSWORD in your .env file'
}

app.set('port', process.env.PORT || 3000);

app.get('/', (request, response) => {
  response.status(404).send({ error: 'Route not found.' })
})

app.get('/api/v1/locations', (request, response) => {
  database('locations').select()
  .then(locations => {
    response.status(200).json(locations)
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.get('/api/v1/locations/:id', (request, response) => {
  const { id } = request.params;
  database('locations').where('id', id).select()
  .then(location => {
    if (!location.length) {
      response.status(404).send('Location not found.')
    } else {
      response.status(200).json(location)
    }
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.get('/api/v1/parks', (request, response) => {
  let activity_type = request.param('activity_type')
  if (activity_type) {
    database('parks').where({ activity_type: activity_type }).select()
    .then(parks => {
      response.status(200).json(parks)
    })
    .catch(error => response.status(500).send({ error: error }));
  } else {
    database('parks').select()
    .then(parks => {
      response.status(200).json(parks)
    })
    .catch(error => response.status(500).send({ error: error }));
  }
})

app.get('/api/v1/parks/:id', (request, response) => {
  const { id } = request.params;
  database('parks').where('id', id).select()
  .then(park => {
    if (!park.length) {
      response.status(404).send('Park not found.')
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
      response.status(404).send('Location not found')
    }
    response.status(200).json(parks)
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.post('/api/v1/locations', checkAuth, (request, response) => {
  const location = request.body;

  if (location.hasOwnProperty('city')) {
    database('locations').insert(location, 'id')
    .then(location => {
      response.status(201).json({ id: location[0] })
    })
    .catch(error => response.status(500).send({ error: error }));
  } else {
    response.status(422).send({ error: 'Unprocessable entity. City is a required field.' })
  }
})

app.post('/api/v1/parks', checkAuth, (request, response) => {
  const park = request.body;
  const parkProps = ['name', 'activity_type', 'activity_description', 'city_id'].every(prop => park.hasOwnProperty(prop));

  if (parkProps) {
    database('parks').insert(park, 'id')
    .then(park => {
      response.status(201).json({ id: park[0] })
    })
    .catch(error => response.status(500).send({ error: error }));
  } else {
    response.status(422).send({ error: 'Unprocessable entity. Please include the following data: name, activity_type, activity_description, city_id' })
  }
})

app.delete('/api/v1/locations/:id', checkAuth, (request, response) => {
  const { id } = request.params;
  database('locations').where('id', id).del()
  .then(location => {
    if (!location.length) {
      response.status(404).send({ error: 'Location not found.' })
    } else {
      response.status(204).send('Location deleted.')
    }
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.delete('/api/v1/parks/:id', checkAuth, (request, response) => {
  const { id } = request.params;
  database('parks').where('id', id).del()
  .then(park => {
    if (!park.length) {
      response.status(404).send({ error: 'Park not found.' })
    } else {
      response.status(204).send('Park deleted.')
    }
  })
  .catch(error => response.status(500).send({ error: error }));
})

app.put('/api/v1/locations/:id', checkAuth, (request, response) => {
  const { id } = request.params;

  if (request.body.hasOwnProperty('id')) {
    response.status(403).send('ID cannot be changed.');
  }

  if (request.body.hasOwnProperty('city')) {
    const newData = request.body;
    database('locations').where('id', id).update(newData)
    .returning('id')
    .then(location => {
      if (!location.length) {
        response.status(404).send('Location does not exist.')
      } else {
        response.status(201).send({ id: location[0] })
      }
    })
    .catch(error => response.status(500).send({ error: error }));
  }
});

app.put('/api/v1/parks/:id', checkAuth, (request, response) => {
  const { id } = request.params
  const parkProps = ['name', 'activity_type', 'activity_description', 'city_id'].every(prop => request.body.hasOwnProperty(prop));

  if (request.body.hasOwnProperty('id')) {
    response.status(403).send('ID cannot be changed.');
  }

  if (parkProps) {
    let newParkData = request.body;
    database('parks').where('id', id).update(newParkData)
    .returning('id')
    .then(park => {
      if (!park.length) {
        response.status(404).send('Park does not exist.')
      } else {
        response.status(201).send({ id: park[0] })
      }
    })
    .catch(error => response.status(500).send({ error: error }));
  }
});

app.patch('/api/v1/parks/:id', checkAuth, (request, response) => {
  const { id } = request.params;
  const parkProps = ['name', 'activity_type', 'activity_description', 'city_id'].some(prop => request.body.hasOwnProperty(prop));

  if (request.body.hasOwnProperty('id')) {
    response.status(403).send('ID cannot be changed.');
  }

  if (parkProps) {
    let newParkData = request.body;
    database('parks').where('id', id).update(newParkData)
    .returning(Object.keys(newParkData))
    .then(park => {
      if (!park.length) {
        response.status(404).send('Park does not exist.')
      } else {
        response.status(201).send({ fields_updated: Object.keys(newParkData)})
      }
    })
    .catch(error => response.status(500).send({ error: error }));
  } else {
    response.status(403).send('Invalid column name');
  }
});

app.use(notFound)

app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}.`);
});

module.exports = app;
