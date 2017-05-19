const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');

const configuration = require('../knexfile')['test'];
const database = require('knex')(configuration);
const server = require('../server');

chai.use(chaiHttp)

describe('Tests for BYOB', () => {

  before((done) => {
    database.migrate.latest()
    .then(() => done());
  });

  beforeEach((done) => {
    database.seed.run()
    .then(() => done());
  });

  describe('API routes', () => {

    describe('GET ROUTES', () => {

      it('should return a 404 error for root route', (done) => {
        chai.request(server)
        .get('/')
        .end((error, response) => {
          response.should.have.status(404)
          response.body.error.should.equal('Route not found.')
          done();
        })
      });

      it('should return all locations', (done) => {
        chai.request(server)
        .get('/api/v1/locations')
        .end((error, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body.length.should.equal(3)
          response.body[0].should.have.property('city')
          response.body[0].should.have.property('id')
          done();
        });
      });

      it('should return a 404 for a non-existent route', (done) => {
        chai.request(server)
        .get('/api/v1/locationssss')
        .end((error, response) => {
          response.should.have.status(404)
          response.text.should.equal('Route not found!')
          done();
        });
      });

      it('should return a specific location by ID', (done) => {
        chai.request(server)
        .get('/api/v1/locations/1')
        .end((error, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body.length.should.equal(1)
          response.body[0].should.have.property('id')
          response.body[0].should.have.property('city')
          response.body[0].should.have.property('created_at')
          response.body[0].should.have.property('updated_at')
          done();
        });
      });

      it('should return an error message if location does not exist', (done) => {
        chai.request(server)
        .get('/api/v1/locations/900')
        .end((error, response) => {
          response.should.have.status(404)
          response.type.should.equal('text/html')
          response.text.should.equal('Location not found.')
          done();
        });
      });

      it('should return all parks', (done) => {
        chai.request(server)
        .get('/api/v1/parks')
        .end((error, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body[0].should.have.property('name')
          response.body[0].should.have.property('city_id')
          response.body[0].should.have.property('activity_type')
          response.body[0].should.have.property('activity_description')
          response.body[0].should.have.property('created_at')
          response.body[0].should.have.property('updated_at')
          done();
        });
      });

      it('should return a specific park by ID', (done) => {
        chai.request(server)
        .get('/api/v1/parks/10')
        .end((error, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body.length.should.equal(1)
          response.body[0].should.have.property('name')
          response.body[0].should.have.property('id')
          response.body[0].should.have.property('city_id')
          response.body[0].should.have.property('activity_type')
          response.body[0].should.have.property('activity_description')
          response.body[0].should.have.property('created_at')
          response.body[0].should.have.property('updated_at')
          done();
        });
      });

      it('should return an error message if park does not exist', (done) => {
        chai.request(server)
        .get('/api/v1/parks/100000')
        .end((error, response) => {
          response.should.have.status(404)
          response.type.should.equal('text/html')
          response.text.should.equal('Park not found.')
          done();
        });
      });

      it('should return parks associated with a specific location', (done) => {
        chai.request(server)
        .get('/api/v1/locations/1/parks')
        .end((error, response) => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body.length.should.equal(3)
          response.body[0].should.have.property('name')
          response.body[0].should.have.property('id')
          response.body[0].should.have.property('city_id')
          response.body[0].should.have.property('activity_type')
          response.body[0].should.have.property('activity_description')
          response.body[0].should.have.property('created_at')
          response.body[0].should.have.property('updated_at')
          done();
        });
      });
    });

    describe('POST Routes', () => {

      it('should add a new location', (done) => {
        chai.request(server)
        .post('/api/v1/locations')
        .set('authorization', process.env.TOKEN)
        .send({ city: 'Vail', id: 4 })
        .end((error, response) => {
          response.should.have.status(201)
          response.should.be.json
          response.body.should.be.a('object')
          response.body.id.should.equal(4)
          done();
        });
      });

      it('should deny POST request w/o JWT', () => {
        chai.request(server)
        .post('/api/v1/locations')
        .send({ city: 'Vail', id: 3 })
        .end((error, response) => {
          response.should.have.status(403)
          reponse.should.be.json
          response.body.should.be.a('object')
          response.body.success.should.equal('false')
          response.body.message.should.equal('You must be authorized to hit this endpoint')
          done();
        });
      });

      it('should deny POST if any data is missing', (done) => {
        chai.request(server)
        .post('/api/v1/locations')
        .set('authorization', process.env.TOKEN)
        .send({ id: 9 })
        .end((error, response) => {
          response.should.have.status(422)
          response.should.be.json
          response.body.should.be.a('object')
          response.body.error.should.equal('Unprocessable entity. City is a required field.')
          done();
        });
      });

      it('should add a new park to a city', (done) => {
        chai.request(server)
        .post('/api/v1/parks')
        .set('authorization', process.env.TOKEN)
        .send(
          { name: 'New Park',
            id: 15,
            city_id: 2,
            activity_type: 'swimming',
            activity_description: 'swim swim swim'
          }
        )
        .end((error, response) => {
          response.should.have.status(201)
          response.should.be.json
          response.body.should.be.a('object')
          response.body.id.should.equal(15)
          done();
        });
      });

      it('should deny POST request w/o JWT', () => {
        chai.request(server)
        .post('/api/v1/parks')
        .send(
          { name: 'New Park',
            id: 15,
            city_id: 2,
            activity_type: 'swimming',
            activity_description: 'swim swim swim'
          }
        )
        .end((error, response) => {
          response.should.have.status(403)
          response.should.be.json
          response.body.should.be.a('object')
          response.body.success.should.equal(false)
          response.body.message.should.equal('You must be authorized to hit this endpoint')
          done();
        });
      });

      it('should deny POST if any data is missing', (done) => {
        chai.request(server)
        .post('/api/v1/parks')
        .set('authorization', process.env.TOKEN)
        .send(
          { name: 'New Park',
            id: 15,
            activity_type: 'swimming',
            activity_description: 'swim swim swim'
          }
        )
        .end((error, response) => {
          response.should.have.status(422)
          response.should.be.json
          response.body.should.be.a('object')
          response.body.error.should.equal('Unprocessable entity. Please include the following data: name, activity_type, activity_description, city_id')
          done();
        });
      });

      it('should delete a specific location by ID if there are no parks associated with the location', (done) => {
        chai.request(server)
        .get('/api/v1/locations')
        .end((error, response) => {
          response.body.length.should.equal(3)
          chai.request(server)
          .delete('/api/v1/locations/3')
          .set('authorization', process.env.TOKEN)
          .end((error, response) => {
            chai.request(server)
            .get('/api/v1/locations')
            .end((error, response) => {
              response.body.length.should.equal(2)
              done();
            });
          });
        });
      });

      it('should delete a specific park by ID', (done) => {
        chai.request(server)
        .get('/api/v1/parks')
        .end((error, response) => {
          response.body.length.should.equal(5)
          chai.request(server)
          .delete('/api/v1/parks/11')
          .set('authorization', process.env.TOKEN)
          .end((error, response) => {
            chai.request(server)
            .get('/api/v1/parks')
            .end((error, response) => {
              response.body.length.should.equal(4)
              done();
            });
          });
        });
      });

      it('should deny a DELETE request to locations without authorization', (done) => {
        chai.request(server)
        .delete('/api/v1/locations/3')
        .end((error, response) => {
          response.should.have.status(403)
          response.should.be.json
          response.body.should.be.a('object')
          response.body.success.should.equal(false)
          response.body.message.should.equal('You must be authorized to hit this endpoint')
          done();
        });
      });

      it('should deny a DELETE request to parks without authorization', (done) => {
        chai.request(server)
        .delete('/api/v1/parks/11')
        .end((error, response) => {
          response.should.have.status(403)
          response.should.be.json
          response.body.should.be.a('object')
          response.body.success.should.equal(false)
          response.body.message.should.equal('You must be authorized to hit this endpoint')
          done();
        });
      });

      it('should update a location when authorized', (done) => {
        chai.request(server)
        .get('/api/v1/locations/1')
        .end((error, response) => {
          response.should.have.status(200)
          response.body[0].city.should.equal('Breckenridge')
          chai.request(server)
          .put('/api/v1/locations/1')
          .set('authorization', process.env.TOKEN)
          .send({ city: 'Crested Butte' })
          .end((error, response) => {
            response.should.have.status(201)
            chai.request(server)
            .get('/api/v1/locations/1')
            .end((error, response) => {
              response.should.have.status(200)
              response.body[0].city.should.equal('Crested Butte')
              done();
            });
          });
        });
      });

      it('should deny an update without authorization', (done) => {
        chai.request(server)
        .get('/api/v1/locations/1')
        .end((error, response) => {
          response.should.have.status(200)
          response.body[0].city.should.equal('Breckenridge')
          chai.request(server)
          .put('/api/v1/locations/1')
          .send({ city: 'Crested Butte' })
          .end((error, response) => {
            response.should.have.status(403)
            response.body.success.should.equal(false)
            response.body.message.should.equal('You must be authorized to hit this endpoint')
            chai.request(server)
            .get('/api/v1/locations/1')
            .end((error, response) => {
              response.should.have.status(200)
              response.body[0].city.should.equal('Breckenridge')
              done();
            });
          });
        });
      });

      it.skip('should throw an error if ID is changed', (done) => {
        chai.request(server)
        .put('/api/v1/locations/1')
        .set('authorization', process.env.TOKEN)
        .send(
          { city: 'Crested Butte',
            id: 5
          }
        )
        .end((error, response) => {
          response.should.have.status(403)
          response.text.should.equal('ID cannot be changed.')
          done();
        });
      });

      it('should update a park when authorized', (done) => {
        chai.request(server)
        .get('/api/v1/parks/10')
        .end((error, response) => {
          response.should.have.status(200)
          response.body[0].name.should.equal('Mt. Quandry')
          response.body[0].activity_type.should.equal('hiking')
          response.body[0].activity_description.should.equal('Summit a 14er.')
          response.body[0].city_id.should.equal(1)
          chai.request(server)
          .put('/api/v1/parks/10')
          .set('authorization', process.env.TOKEN)
          .send(
            { name: 'Peak 8',
              activity_type: 'biking',
              activity_description: 'Ride the mtn.',
              city_id: 1
           }
          )
          .end((error, response) => {
            response.should.have.status(201)
            chai.request(server)
            .get('/api/v1/parks/10')
            .end((error, response) => {
              response.should.have.status(200)
              response.body[0].name.should.equal('Peak 8')
              response.body[0].activity_type.should.equal('biking')
              response.body[0].activity_description.should.equal('Ride the mtn.')
              response.body[0].city_id.should.equal(1)
              done();
            });
          });
        });
      });

      it('should deny an update to a park when unauthorized', (done) => {
        chai.request(server)
        .get('/api/v1/parks/10')
        .end((error, response) => {
          response.should.have.status(200)
          response.body[0].name.should.equal('Mt. Quandry')
          response.body[0].activity_type.should.equal('hiking')
          response.body[0].activity_description.should.equal('Summit a 14er.')
          response.body[0].city_id.should.equal(1)
          chai.request(server)
          .put('/api/v1/parks/10')
          .send(
            { name: 'Peak 8',
              activity_type: 'biking',
              activity_description: 'Ride the mtn.',
              city_id: 1
           }
          )
          .end((error, response) => {
            response.should.have.status(403)
            response.body.success.should.equal(false)
            response.body.message.should.equal('You must be authorized to hit this endpoint')
            chai.request(server)
            .get('/api/v1/parks/10')
            .end((error, response) => {
              response.should.have.status(200)
              response.body[0].name.should.equal('Mt. Quandry')
              response.body[0].activity_type.should.equal('hiking')
              response.body[0].activity_description.should.equal('Summit a 14er.')
              response.body[0].city_id.should.equal(1)
              done();
            });
          });
        });
      });

      it('should partially update a park when authorized', (done) => {
        chai.request(server)
        .get('/api/v1/parks/10')
        .end((error, response) => {
          response.should.have.status(200)
          response.body[0].name.should.equal('Mt. Quandry')
          response.body[0].activity_type.should.equal('hiking')
          response.body[0].activity_description.should.equal('Summit a 14er.')
          response.body[0].city_id.should.equal(1)
          chai.request(server)
          .patch('/api/v1/parks/10')
          .set('authorization', process.env.TOKEN)
          .send(
            { activity_type: 'rock climbing',
              activity_description: 'scale some rocks'
            }
          )
          .end((error, response) => {
            response.should.have.status(201)
            chai.request(server)
            .get('/api/v1/parks/10')
            .end((error, response) => {
              response.should.have.status(200)
              response.body[0].name.should.equal('Mt. Quandry')
              response.body[0].activity_type.should.equal('rock climbing')
              response.body[0].activity_description.should.equal('scale some rocks')
              response.body[0].city_id.should.equal(1)
              done();
            });
          });
        });
      });

      it('should deny partial update to a park when unauthorized', (done) => {
        chai.request(server)
        .get('/api/v1/parks/10')
        .end((error, response) => {
          response.should.have.status(200)
          response.body[0].name.should.equal('Mt. Quandry')
          response.body[0].activity_type.should.equal('hiking')
          response.body[0].activity_description.should.equal('Summit a 14er.')
          response.body[0].city_id.should.equal(1)
          chai.request(server)
          .patch('/api/v1/parks/10')
          .send(
            { activity_type: 'rock climbing',
              activity_description: 'scale some rocks'
            }
          )
          .end((error, response) => {
            response.should.have.status(403)
            response.body.success.should.equal(false)
            response.body.message.should.equal('You must be authorized to hit this endpoint')
            chai.request(server)
            .get('/api/v1/parks/10')
            .end((error, response) => {
              response.should.have.status(200)
              response.body[0].name.should.equal('Mt. Quandry')
              response.body[0].activity_type.should.equal('hiking')
              response.body[0].activity_description.should.equal('Summit a 14er.')
              response.body[0].city_id.should.equal(1)
              done();
            });
          });
        });
      });

    });
  });
});
