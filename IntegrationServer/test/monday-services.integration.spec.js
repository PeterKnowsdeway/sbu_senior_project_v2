/* const chai = require('chai');
const expect = chai.expect;

const { getBoardItems } = require('../src/services/monday-services.js');

describe('getBoardItems()', () => {
  it('should return an array of board items', async () => {
    // Mock response
    const mockResponse = {
      data: {
        boards: [
          {
            name: 'Board 1',
            items: [
              {
                name: 'Item 1',
                updated_at: '2022-01-01',
                column_values: [
                  {
                    id: 'column1',
                    title: 'Column 1',
                    text: 'Value 1'
                  }
                ]
              },
              {
                name: 'Item 2',
                updated_at: '2022-02-01',
                column_values: [
                  {
                    id: 'column2',
                    title: 'Column 2',
                    text: 'Value 2'
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    // Mock Monday Client API
    const mondayClient = {
      api: (query, { variables }) => {
        return new Promise((resolve, reject) => {
          resolve(mockResponse);
        });
      }
    };

    // Call the function with mock data
    const token = 'TOKEN';
    const boardId = 1234;
    const boardItems = await getBoardItems(token, boardId, mondayClient);

    // Check if the response is an array of board items
    expect(boardItems).to.be.an('array');
    expect(boardItems[0]).to.have.property('name', 'Item 1');
    expect(boardItems[0]).to.have.property('updated_at', '2022-01-01');
    expect(boardItems[0].column_values[0]).to.have.property('id', 'column1');
    expect(boardItems[0].column_values[0]).to.have.property('title', 'Column 1');
    expect(boardItems[0].column_values[0]).to.have.property('text', 'Value 1');
  });
}); */