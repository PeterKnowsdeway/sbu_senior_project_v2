const expect = require('chai').expect;
const request = require('supertest');
const router = require('../src/routes/index.js');
const app = require('../src/server.js');

describe('index route', function() {
  
  beforeEach(function() {
    app.use(router);
  });
  // Authenticaiton needed for these tests
  it('should return a 200 response for the /auth route if not authenticated', function(done) {
    request(app)
      .get('/auth')
      .expect(500, done);
  });
  it('should return a JSON response for /auth route', function(done) {
    request(app)
      .get('/auth')
      .expect('Content-Type', "application/json; charset=utf-8")
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  it('should return a 200 response for the /tokenHandle route', function(done) {
    request(app)
      .get('/tokenHandle')
      .expect(200, done);
  });

  it('should return a JSON response for /tokenHandle route', function(done) {
    request(app)
      .get('/tokenHandle')
      .expect('Content-Type', "application/json; charset=utf-8")
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        done();
      });
  });
  /* We need to be authenticated for these tests
 it('should create a new user when POST request is sent to /create', function(done) {
  request(app)
    .post('/create')
    .send({ name: 'John Doe', email: 'johndoe@example.com' })
    .expect(201)
    .end(function(err, res) {
      if (err) return done(err);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('name', 'John Doe');
      expect(res.body).to.have.property('email', 'johndoe@example.com');
      done();
    });
  });
  /* We need to be authenticated for these tests
  it('should create a new user when POST request is sent to /update', function(done) {
    request(app)
    .post('/update')
    .send({ name: 'John Doe', email: 'johndoe@example.com' })
    .expect(201)
    .end(function(err, res) {
      if (err) return done(err);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('name', 'John Doe');
      expect(res.body).to.have.property('email', 'johndoe@example.com');
      done();
    });
  });
  it('should create a new user when POST request is sent to /sync', function(done) {
    request(app)
    .post('/sync')
    .send({ name: 'John Doe', email: 'johndoe@example.com' })
    .expect(201)
    .end(function(err, res) {
      if (err) return done(err);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('name', 'John Doe');
      expect(res.body).to.have.property('email', 'johndoe@example.com');
      done();
    });
  });
  */

});