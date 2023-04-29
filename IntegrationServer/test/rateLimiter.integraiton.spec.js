/*
Note: These are working tests, but they will cause other integration tests to fail as it properly shuts down the endpoints once the limit has been reached. If you need to modify the rate limter then please uncomment the code and adjust the tests as needed. The Lightwise v2 team recomends that this test is ran in isolation when testing. 
*/


/* const chai = require('chai');
const chaiHttp = require('chai-http');
const rateLimiterUsingThirdParty = require('../src/middleware/rate-limiter');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Rate Limiter Middleware', () => {
  it('should limit the number of requests to 100 per 24 hours', (done) => {
    const app = require('../src/server');
    app.use('/test', rateLimiterUsingThirdParty);

    // Send 100 requests in less than 24 hours
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(chai.request(app).get('/test'));
    }

    // Wait for all requests to complete
    Promise.all(requests)
      .then((responses) => {
        // Expect all responses to have a status code of 200
        responses.forEach((res) => {
          expect(res).to.have.status(200);
        });

        // Send one more request after the limit has been reached
        chai.request(app).get('/test')
          .end((err, res) => {
            expect(res).to.have.status(429);
            expect(res.body).to.have.property('message').equal('You have exceeded the 100 requests in 24 hrs limit!');
            done();
          });
      })
      .catch((err) => {
        done(err);
      });
  });
  
  it('should use a custom key generator for rate limiting', () => {
    const req1 = { ip: '192.168.1.1' };
    const req2 = { user: { id: '123' } };
    const req3 = { ip: '127.0.0.1' };
    
    expect(rateLimiterUsingThirdParty.keyGenerator(req1)).to.equal('192.168.1.1-trusted');
    expect(rateLimiterUsingThirdParty.keyGenerator(req2)).to.equal('123-authenticated');
    expect(rateLimiterUsingThirdParty.keyGenerator(req3)).to.equal('127.0.0.1');
  });
}); */