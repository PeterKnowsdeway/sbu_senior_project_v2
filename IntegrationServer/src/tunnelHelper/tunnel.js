/*
  - Local tunnel is required if running in local development.
  - In the event you are trying to run a different tunnel service by reconfiguring this file: check createTunnel's tunnel call.
*/

const localtunnel = require('localtunnel')
const MAX_ATTEMPTS = 5 // Max attempts at creating the tunnel
const logger = require('../middleware/logging.js')

// Make a function that accepts a port number, and creats localtunnel at that port, and also has a variable keeping track of the number of times it tried to create the tunnel
const createTunnel = async (port, retries = 0) => {
  // Attempt to create a local tunnel with a desired host and subdomain by passing port and domain details.
  const tunnel = await localtunnel({
    port,
    subdomain: process.env.TUNNEL_SUBDOMAIN
  })

  // Check if the desired subdomain was obtained.
  // IF it was not, retry unitl MAX_ATTEMPS is reached, or until the desired subdomain is obtianed
  const usedSubDomain = tunnel.url.includes(process.env.TUNNEL_SUBDOMAIN)
  if (!usedSubDomain && retries < MAX_ATTEMPTS) { // If requested subdomain not available, try again until specified retries reached.
    logger.warn('subdomain not available')
    tunnel.close() // close the tunnel so a new attempt can be made
    return setTimeout(
      () => { createTunnel(port, ++retries) },
      500
    ) // retry making the tunnel again after 200 miliseconds
  }

  if (!usedSubDomain) { // if the desired subdomain could not be obtained, tell the user so then can do something about that.
    logger.warn('could not use the wanted subdomain, a random one was used instead')
  }

  console.log(`listening at localhost:${port} || tunnel: ${tunnel.url}`)
}

module.exports = {
  createTunnel
} // export the createTunnel function for use elsewhere.
