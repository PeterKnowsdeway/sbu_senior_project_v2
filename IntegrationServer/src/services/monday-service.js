/**
 * This file contains the functions that are used to perform the queries to the Monday API.
 */

const initMondayClient = require('monday-sdk-js')
const logger = require('../middleware/logging.js')
/**
 * It takes a token and a boardId as parameters, and returns the items on the board.
 * @param token - The token you get from the OAuth flow
 * @param boardId - The ID of the board you want to get items from.
 * @returns An array containing the Board items queried
 */
const getBoardItems = async (token, boardId) => {
  try {
    const mondayClient = initMondayClient()
    mondayClient.setToken(token)

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
    }`
    const variables = { boardId }

    const response = await mondayClient.api(query, { variables })


    return response.data.boards[0].items
  } catch (err) {
    logger.error({
      message: `Error retreiving contacts from Monday.com ${err}`,
      function: 'getBoardItems',
      params: { token, boardId },
      error: err.stack
    })
  }
}

module.exports = {
  getBoardItems
}
