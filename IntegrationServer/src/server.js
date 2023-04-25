// Required for us to use process.env
require('dotenv').config() 
// Node.js express
const express = require('express') 
// Node.js filter for POSTs
const bodyParser = require('body-parser') 
// Express instance.
const app = express() 
const schedule = require('node-schedule')

// Import all of the exported router objects from the routes folder into this file.
const routes = require('./routes') 
// Telling the app to "listen at" with routes passed in will enable all the defined endpoints.
const { setOAuthCredentials } = require('./startup-helper.js')
const { loadConfigVariables } = require('./startup-helper.js')

// Require file to make it's code run upon startup.
// Temporary access token refresher 
// Schedules itself to run periodically when loaded, to keep the access token from expiring
const { useAccessToken } = require('./OAuth/token-store-periodic.js') 

// Schedules useAccessToken to run every hour
schedule.scheduleJob('0 * * * *', useAccessToken) 

// Have all requests filtered through bodyParser so that the body of all the POST requests sent to the API to be read and used.
app.use(bodyParser.json()) 

// Print the method, path, and ip of all requests. This will act as middleware that all requests are filtered through.
app.use(function (req, res, next) {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip)
  // console.log(req.query);
  next()
})

// run startup functions
// IF token.json exists (aka OAuth Credentials), load them.
// IF config.json exists, load them.
setOAuthCredentials() 
loadConfigVariables() 

// Tells the app to mount the paths contained in the router object imported from routes/index.js
app.use(routes) 

// Get port number from environment file.
const { PORT: port } = process.env 

// Determine which tunnel to run
// custom tunnel - currently set for loca.lt (localTunnel; not actually local). Loca.lt is NOT reliable for sub-domain.
// requires tunnel.js system file's createTunnel function for tunnel creation
const run = process.env.RUN 
if (run === 'Dev') { 
  const { createTunnel } = require('./tunnelHelper/tunnel') 

  // See tunnelHelper/tunnel.js - this sends a request to loca.lt which will attempt to get the .env specified sub-domain.
  app.listen(port, () => {
    createTunnel(port) 
  })
} else { // replit
  // Tell the app to listen at port, and then create a tunnel.
  // Request replit to use a specific port for node.js to run on.
  // Replit has its own stuff for node.js setups which run automatically when started.
  app.listen(port, () => { 
    console.log(`Listening on port: ${port}`) 
  })
}

module.exports = app 
