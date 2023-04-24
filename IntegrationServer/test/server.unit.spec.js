const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const app = require('../src/server.js')
const sinon = require('sinon')
const dotenv = require('dotenv')
const nock = require('nock')
chai.use(chaiHttp)

describe('API endpoints', function () {
  it('should log all requests', function (done) {
    const consoleLogStub = sinon.stub(console, 'log')
    chai.request(app)
      .get('/test')
      .end(function (err, res) {
        sinon.assert.calledWith(consoleLogStub, 'GET /test - ::ffff:127.0.0.1')
        consoleLogStub.restore()
        done()
      })
  })

  it('should return a 404 response for an undefined endpoint', function (done) {
    chai.request(app)
      .get('/undefined')
      .end(function (err, res) {
        expect(res).to.have.status(404)
        done()
      })
  })

  it('should incorrectly parse the request body for a POST request', function (done) {
    chai.request(app)
      .post('/post')
      .send({ name: 'John', age: 30 })
      .end(function (err, res) {
        expect(res).to.have.status(404)
        done()
      })
  })

  // add more tests for other endpoints here
})

it('should correctly load OAuth credentials from a file', function () {
  // Create a temporary token file with some credentials
  const fs = require('fs')
  const token = { access_token: '.apps.googleusercontent.com', refresh_token: 'GOCSPX-', expires_in: 3600 }
  fs.writeFileSync('../token.json', JSON.stringify(token))

  // Call the setOAuthCredentials function
  const { setOAuthCredentials } = require('../src/startup-helper.js')
  setOAuthCredentials()

  // Assert that the OAuth credentials have been loaded
  expect(process.env.GOOGLE_CLIENT_ID).to.equal(token.access_token)
  expect(process.env.GOOGLE_CLIENT_SECRET).to.equal(token.refresh_token)

  // Clean up the token file
  fs.unlinkSync('../token.json')
})

it('should correctly load configuration variables from a file', function () {
  // Create a temporary config file with some variables
  const fs = require('fs')
  const config = { PORT: 3000, RUN: 'development' }
  fs.writeFileSync('./config.json', JSON.stringify(config))

  // Call the loadConfigVariables function
  const { loadConfigVariables } = require('../src/startup-helper.js')
  loadConfigVariables()

  // Assert that the configuration variables have been loaded
  expect(process.env.PORT).to.equal(String(config.PORT))
  expect(process.env.ENVIRONMENT).to.equal(config.ENVIRONMENT)
  console.log(process.env.ENVIRONMENT)

  // Clean up the config file
  fs.unlinkSync('./config.json')
})


/* it('should create a tunnel for the specified port', function(done) {
  const { createTunnel } = require('../src/tunnelHelper/tunnel');
  createTunnel(3000)
    .then(function(tunnelUrl) {
      expect(tunnelUrl).to.not.be.empty;
      done();
    })
    .catch(function(err) {
      done(err);
    });
}).timeout(15000); // increase timeout to allow for tunnel creation */