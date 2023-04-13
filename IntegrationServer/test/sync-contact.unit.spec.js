const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const { fetchContacts } = require('../src/featureControl/sync-contacts.js');

chai.use(chaiHttp);

/* describe('fetchContacts', function () {
  it('should return 200 status code and an empty object', function (done) {
    const req = {
      session: {
        shortLivedToken: 'abc123'
      },
      body: {
        payload: {
          inputFields: {
            boardID: '123'
          }
        }
      }
    };
    const res = {
      status: function (statusCode) {
        expect(statusCode).to.equal(200);
        return this;
      },
      send: function (data) {
        expect(data).to.deep.equal({});
        done();
      },
      json: function () {
        done(new Error('should not be called'));
      }
    };

    fetchContacts(req, res);
  });

  it('should return 500 status code and an error message when an error occurs', function (done) {
    const req = {
      session: {
        shortLivedToken: 'abc123'
      },
      body: {
        payload: {
          inputFields: {
            boardID: '123'
          }
        }
      }
    };
    const res = {
      status: function (statusCode) {
        expect(statusCode).to.equal(500);
        return this;
      },
      send: function () {
        done(new Error('should not be called'));
      },
      json: function (data) {
        expect(data).to.deep.equal({ error: 'Internal Server Error' });
        done();
      }
    };

    // mock getBoardItems to throw an error
    const getBoardItems = async () => {
      throw new Error('test error');
    };
    const oldGetBoardItems = global.getBoardItems;
    global.getBoardItems = getBoardItems;

    fetchContacts(req, res);

    // restore getBoardItems
    global.getBoardItems = oldGetBoardItems;
  });
}); */
