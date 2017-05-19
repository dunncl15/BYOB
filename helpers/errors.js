const notFound = (request, response, next) => {
  response.status(404).send('Route not found!');
}

module.exports = notFound;
