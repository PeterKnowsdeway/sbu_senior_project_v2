const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient();

(async () => {
  await client.connect();
})();

client.on('connect', () => console.log('Redis Client Connected'));
client.on('error', (err) => console.log('Redis Client Connection Error', err));

async function asyncGet(key) {
  try {
    // If Redis client is not connected, connect to Redis
    // Attempt to retrieve data from Redis
    const data = await client.get(key);
    return data;
  } catch (err) {
    console.error(`Error retrieving ${key} from Redis: ${err}`);
    throw err;
  }
}

async function asyncDel(key) {
  try {
    const result = await client.del(key);
    return result;
  } catch (err) {
    console.error(`Error deleting ${key} from Redis: ${err}`);
    throw err;
  }
}


module.exports = {
    client,
    asyncGet,
    asyncDel,
};