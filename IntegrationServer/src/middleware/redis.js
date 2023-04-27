/*
 * This file is a wrapper around the Redis client.
 * It provides a way to connect to Redis and to asynchronously get and delete data from Redis.
 * It also provides a way to check if the Redis client is connected.
 */

const redis = require('redis')


const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
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
    throw err
  }
}

async function asyncSet (key, value) {
  try {
    // If Redis client is not connected, connect to Redis
    // Attempt to retrieve data from Redis
    const data = await client.set(key, value)
    return data
  } catch (err) {
    throw err
  }
}

async function asyncDel (key) {
  try {
    const result = await client.del(key)
    return result
  } catch (err) {
    throw err
  }
}

module.exports = {
  client,
  asyncGet,
  asyncDel,
  asyncSet
}
