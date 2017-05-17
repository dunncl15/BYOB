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


app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}.`);
});

module.exports = app;
