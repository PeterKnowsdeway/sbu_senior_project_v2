const localtunnel = require('localtunnel') // Needed to run localtunnel.
const { logger } = require('../middlleware/logger.js')
const { v4: uuidv4 } = require('uuid')
const ID = uuidv4()
// In the event you are trying to run a different tunnel service by reconfiguring this file: check createTunnel's tunnel call. This is most likely part to need changing, including potentially requiring a HOST parameter.

const MAX_ATTEMPTS = 5 // Max attempts at creating the tunnel

/**
* A function that creates a local tunnel on a specified port with a given subdomain.
* @async
* @function createTunnel
* @param {number} port - The port number to create the tunnel on.
* @param {number} retries - The number of times the function has attempted to create the tunnel.
*
* @mermaid
*  graph LR
*    A[createTunnel function] --> B[Create local tunnel]
*    B --> C[Check if desired subdomain is obtained]
*    C -- Yes --> D[Log tunnel info]
*    C -- No --> E[Retry creating tunnel]
*    E --> B
*    E((Max attempts reached)) --> F[Log warning]
*/
const createTunnel = async (port, retries = 0) => {
  const tunnel = await localtunnel({ // attempt to create a local tunnel with a desired host and subdomain by passing port and domain details.
    port,
    subdomain: process.env.TUNNEL_SUBDOMAIN
  })

  // Check if the desired subdomain was obtained. IF it was not, retry unitl MAX_ATTEMPS is reached, or until the desired subdomain is obtianed
  const usedSubDomain = tunnel.url.includes(process.env.TUNNEL_SUBDOMAIN)
  if (!usedSubDomain && retries < MAX_ATTEMPTS) { // If requested subdomain not available, try again until specified retries reached.
    logger.warn({
      requestID: ID,
      message: `Subdomain not available: ${usedSubDomain}`,
      function: 'createTunnel',
      params: { usedSubDomain }
    })
    tunnel.close() // close the tunnel so a new attempt can be made
    return setTimeout(
      () => { createTunnel(port, ++retries) },
      500
    ) // retry making the tunnel again after 200 miliseconds
  }

  if (!usedSubDomain) { // if the desired subdomain could not be obtained, tell the user so then can do something about that.
    logger.warn({
      requestID: ID,
      message: `Could not use the wanted subdomain, a random one was used instead: ${usedSubDomain}`,
      function: 'createTunnel',
      params: { usedSubDomain }
    })
  }

  logger.info({
    requestID: ID,
    message: `:istening at localhost:${port} || tunnel: ${tunnel.url}`,
    function: 'createTunnel',
    params: { port, tunnel }
  })
}

module.exports = {
  createTunnel
} // export the createTunnel function for use elsewhere.
