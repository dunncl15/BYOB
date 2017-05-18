
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');

const configuration = require('../knexfile')['test'];
const database = require('knex')(configuration);
const server = require('../server');

chai.use(chaiHttp)

describe('', () => {

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
          response.body.length.should.equal(2)
          response.body[0].should.have.property('city')
          response.body[0].should.have.property('id')
          done();
        });
      });

      it.skip('should return a 404 for a non-existent route', (done) => {
        chai.request(server)
        .get('/api/v1/locationssss')
        .end((error, response) => {
          response.should.have.status(404)
          respone.should.have.text('Route not found!')
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
  });
});
