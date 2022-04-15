const initMondayClient = require('monday-sdk-js');

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
    const variables = {boardId};

    const response = await mondayClient.api(query, { variables });
	console.log(response.data);
    return response.data.boards[0].items;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getBoardItems,
};