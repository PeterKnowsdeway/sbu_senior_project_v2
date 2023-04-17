const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const { fetchContacts } = require('../src/featureControl/sync-contacts.js');

chai.use(chaiHttp);

/* TODO:

Test the getBoardItems() function to ensure that it retrieves the correct board items from Monday.com.

Test the getContactMappingByResourceName() function to ensure that it returns the correct contact mapping for a given resource name.

Test the createContactService() function to ensure that it creates a new contact correctly.

Test the updateContactService() function to ensure that it updates an existing contact correctly.

Test the updateContacts() function to ensure that it updates each contact correctly.

Test the populate() function to ensure that it correctly synchronizes contacts between Monday.com and Google Contacts.

Test the error handling in various functions to ensure that any errors are handled appropriately and a 500 response is returned.

*/

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
