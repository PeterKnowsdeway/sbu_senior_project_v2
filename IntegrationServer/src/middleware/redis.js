/*
 * This file is a wrapper around the Redis client.
 * It provides a way to connect to Redis and to asynchronously get and delete data from Redis.
 * It also provides a way to check if the Redis client is connected.
 */
const redis = require('redis')

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

(async () => {
  await client.connect()
})()

client.on('connect', () => console.log('Redis Client Connected'))
client.on('error', (err) => console.log('Redis Client Connection Error', err))

async function asyncGet (key) {
  try {
    // If Redis client is not connected, connect to Redis
    // Attempt to retrieve data from Redis
    const data = await client.get(key)
    console.log(data)
    return data
  } catch (err) {
    logger.error({
      message: `Error retrieving ${key} from Redis: ${err}`,
      function: 'asyncGet',
      params: { key }
    })
    throw err
  }
}

async function asyncSet (key, value) {
  try {
    // If Redis client is not connected, connect to Redis
    // Attempt to retrieve data from Redis
    return await client.set(key, value)
  } catch (err) {
    logger.error({
      message: `Error setting ${key} in Redis: ${err}`,
      function: 'asyncSet',
      params: { key, value }
    })
    throw err
  }
}

async function asyncDel (key) {
  try {
    return await client.del(key)
  } catch (err) {
    logger.error({
      message: `Error deleting ${key} in Redis: ${err}`,
      function: 'asyncDel',
      params: { key }
    })
    throw err
  }
}

module.exports = {
  client,
  asyncGet,
  asyncDel,
  asyncSet
}