const { expect } = require('chai');
const sinon = require('sinon');
const { ContactMapping } = require('../src/db/models');
const {
  getContactMapping,
  createContactMapping,
  updateContactMapping,
  deleteDatabse,
} = require('../src/services/database-services/contact-mapping-service');
console.log(ContactMapping);
describe('Contact Mapping Service', () => {

  beforeEach(async () => {
    await ContactMapping.destroy({ where: {}});
  })
  
  afterEach(() => {
    sinon.restore();
  });

  describe('getContactMapping', () => {
    it('should retrieve a contact mapping from the database by itemID', async () => {
      const mockContactMapping = { id: 1, resourceName: 'Primary Email', etag: 'jane@example.com' };
      sinon.stub(ContactMapping, 'findByPk').returns(mockContactMapping);

      const result = await getContactMapping(1);

      expect(result).to.deep.equal(mockContactMapping);
      expect(ContactMapping.findByPk.calledOnceWith(1)).to.be.true;
    });

    it('should log an error if the database query fails', async () => {
      try {
        await getContactMapping(1);
      } catch (error) {
        expect(error).to.be.an.instanceOf(error);
      }
    });
  });

  describe('createContactMapping', () => {
    it('should create a new contact mapping in the database with the provided attributes', async () => {
      const mockAttributes = { itemID: 1, resourceName: 'Primary Email', etag: 'jane@example.com' };

      await createContactMapping(mockAttributes);

       const result = await ContactMapping.findOne({ where: { id: 1 } });
       expect(result).to.not.be.null;
       expect(result.resourceName).to.equal(mockAttributes.resourceName);
       expect(result.etag).to.equal(mockAttributes.etag);
    });

    it('should log an error if the database create operation fails', async () => {
      try {
        await createContactMapping({
          resourceName: 'Primary Email',
          etag: 'someone@email.com'
        });
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
      }
    });
  });

  describe('updateContactMapping', () => {
    it('should update an existing contact mapping in the database with the provided attributes', async () => {
      const mockUpdates = { resourceName: 'Secondary Email', etag: 'jane.doe@example.com' };
      sinon.stub(ContactMapping, 'update').returns(1);

      const result = await updateContactMapping(1, mockUpdates);

      expect(result).to.equal(1);
      expect(ContactMapping.update.calledOnceWith(mockUpdates, { where: { id: 1 } })).to.be.true;
    });

    it('should log an error if the database update operation fails', async () => {
      try {
        await updateContactMapping(1, { resourceName: 'Primary Email' });
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
      }
    });
  });

    describe('deleteDatabse', () => {
      it('should delete all data from the ContactMapping table', async () => {
      try {
        // Call the deleteDatabase function to delete all data from ContactMapping table
        await deleteDatabse();
  
        // Query the ContactMapping table to make sure it's empty
        const queryResult = await ContactMapping.findAll();
        expect(queryResult.length).to.equal(0);
      } catch (err) {
        // Handle any errors that might occur
        console.error(err);
        throw err;
      }
    });
  });
});


