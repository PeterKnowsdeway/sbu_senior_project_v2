const localtunnel = require('localtunnel');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const logger = require('../middleware/logger.js');

const ID = uuidv4();
const MAX_ATTEMPTS = 5;

/**
* A function that creates a local tunnel on a specified port with a given subdomain.
* @async
* @function createTunnel
* @param {number} port - The port number to create the tunnel on.
* @param {number} retries - The number of times the function has attempted to create the tunnel.
*/
const createTunnel = async (port) => {
  const tunnel = await promisify(localtunnel)({ port, subdomain: process.env.TUNNEL_SUBDOMAIN })

  let usedSubDomain = tunnel.url.includes(process.env.TUNNEL_SUBDOMAIN)

  for (let retries = 0; !usedSubDomain && retries < MAX_ATTEMPTS; retries++) {
    logger.warn({
      requestID: ID,
      message: `Subdomain not available: ${usedSubDomain}`,
      function: 'createTunnel',
      params: { usedSubDomain },
    })

    await promisify(setTimeout)(500)
    tunnel.close()

    usedSubDomain = tunnel.url.includes(process.env.TUNNEL_SUBDOMAIN)
  }

  if (!usedSubDomain) {
    logger.warn({
      requestID: ID,
      message: `Could not use the wanted subdomain, a random one was used instead: ${usedSubDomain}`,
      function: 'createTunnel',
      params: { usedSubDomain },
    })
  }

  logger.info({
    requestID: ID,
    message: `Listening at localhost:${port} || tunnel: ${tunnel.url}`,
    function: 'createTunnel',
    params: { port, tunnel },
  })
}

module.exports = {
  createTunnel,
}
