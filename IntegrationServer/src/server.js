require('dotenv').config() // required for us to use process.env
const express = require('express') // node.js express
const bodyParser = require('body-parser') // node.js filter for POSTs
const app = express() // express instance.

const routes = require('./routes') // Import all of the exported router objects from the routes folder into this file.
// Telling the app to "listen at" with routes passed in will enable all the defined endpoints.
const { setOAuthCredentials } = require('./startup-helper.js')
const { loadConfigVariables } = require('./startup-helper.js')

// require file to make it's code run upon startup.
require('./OAuth/token-store-periodic.js') // temporary access token refresher - schedules itself to run periodically when loaded, to keep the access token from expiring

app.use(bodyParser.json()) // Have all requests filtered through bodyParser so that the body of all the POST requests sent to the API to be read and used.

// Print the method, path, and ip of all requests. This will act as middleware that all requests are filtered through.
app.use(function (req, res, next) {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip)
  // console.log(req.query);
  next()
})

// run startup functions
setOAuthCredentials() // IF token.json exists (aka OAuth Credentials), load them.
loadConfigVariables() // IF config.json exists, load them.

app.use(routes) // Tells the app to mount the paths contained in the router object imported from routes/index.js

const { PORT: port } = process.env // get port number from environment file.

const run = process.env.RUN // determine which tunnel to run
if (run === 'Dev') { // custom tunnel - currently set for loca.lt (localTunnel; not actually local). Loca.lt is NOT reliable for sub-domain.
  const { createTunnel } = require('./tunnelHelper/tunnel') // requires tunnel.js system file's createTunnel function for tunnel creation

  app.listen(port, () => {
    createTunnel(port) // see tunnelHelper/tunnel.js - this sends a request to loca.lt which will attempt to get the .env specified sub-domain.
  })
} else { // replit
  // Tell the app to listen at port, and then create a tunnel.
  app.listen(port, () => { // Request replit to use a specific port for node.js to run on.
    console.log(`Listening on port: ${port}`) // replit has its own stuff for node.js setups which run automatically when started.
  })
}

module.exports = app // module.exports is a node.js thing which is needed for express to trigger endpoints?
