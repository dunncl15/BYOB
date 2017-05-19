const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const config = require('dotenv').config().parsed;

app.set('secretKey', process.env.CLIENT_SECRET || config.CLIENT_SECRET);
let token = jwt.sign('token', app.get('secretKey'));

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

module.exports = checkAuth;
