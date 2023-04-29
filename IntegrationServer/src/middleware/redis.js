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

function asyncGet(key) {
  return new Promise((resolve, reject) => {
    client.get(key, (err, reply) => {
      if (err) {
        reject(err)
      } else {
        resolve(reply)
      }
    })
  })
}

function asyncSet(key, value) {
  return new Promise((resolve, reject) => {
    client.set(key, value, (err, reply) => {
      if (err) {
        reject(err)
      } else {
        resolve(reply)
      }
    })
  })
}

function asyncDel(key) {
  return new Promise((resolve, reject) => {
    client.del(key, (err, reply) => {
      if (err) {
        reject(err)
      } else {
        resolve(reply)
      }
    })
  })
}

module.exports = {
  client,
  asyncGet,
  asyncDel,
  asyncSet
}
