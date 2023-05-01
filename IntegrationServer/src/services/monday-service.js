const initMondayClient = require('monday-sdk-js');
const { logger } = require('../../middleware/logger.js')
const { v4: uuidv4 } = require('uuid');
const ID = uuidv4()

/**
 * It takes a token and a boardId as parameters, and returns the items on the board.
 * @param token - The token you get from the OAuth flow
 * @param boardId - The ID of the board you want to get items from.
 * @returns An array containing the Board items queried 
 */

const getBoardItems = async (token, boardId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);

    const query = `query ($boardId: [Int]){
      boards(limit:1 ids:$boardId) {
        name
        items {
          name 
          updated_at
          column_values {
            id
            title
            text
          }
        }
      }
    }`;
    const variables = { boardId };

    const response = await mondayClient.api(query, { variables });
    return response.data.boards[0].items;
  } catch (err) {
    logger.error({
      pid: process.pid,
      requestID: ID,
      message: `Error: An error occured during query: ${err}`,
      function: 'getBoardItems',
      params: {(token, boardId },
      stacktrace: err.stack
    })
    throw err
  }
};

module.exports = {
  getBoardItems
};