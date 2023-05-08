/**
  * This loads all of the necessary dependencies and routes, sets up the application to listen on a specified port, and runs a startup script to initialize variables.
  * @module
*/
require('dotenv').config() // Loads environment variables from a .env file into process.env.
const express = require('express') // Importing the express module
const bodyParser = require('body-parser') // Importing the bodyParser module to parse incoming request bodies
const app = express() // Creating an instance of the express application
const cors = require('cors') // Importing cors module to enable Cross-Origin Resource Sharing

const swaggerUI = require('swagger-ui-express') // Importing swagger UI to create API documentation
const swaggerJsDoc = require('swagger-jsdoc') // Importing swagger-jsdoc to generate OpenAPI specifications for the API

const routes = require('./routes') // Importing the router objects from the routes folder into this file.

// Importing the functions from startup-helper.js
const { setOAuthCredentials } = require('./startup-helper.js')
const { loadConfigVariables } = require('./startup-helper.js')

const { getNewToken } = require('./OAuth/google-auth.js'); //loads a file which refreshes temporary access token
schedule.scheduleJob('0 * * * *', getNewToken); //Schedules useAccessToken to run every hour

// Defining the swagger options for API documentation
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Contacts Integration API',
      version: '2.0.0',
      description: 'A contacts integration between Monday.com and Google Contacts'
    },
    servers: [
      {
        url: 'https://sbuseniorprojectv2.peterwelter.repl.co/'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API route files
}

// Generating the swagger specification
const specs = swaggerJsDoc(options)

// Setting up the Swagger UI for API documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs))

// Setting up coverage reports endpoint for code coverage documentaiton
app.use('/coverage', express.static('./coverage'))

// Setting up JSDOCS3 endpoint for code documentaiton
app.use('/docs', express.static('./docs'))

// Parsing the request body as JSON
app.use(bodyParser.json())

// Enabling Cross-Origin Resource Sharing
app.use(cors())

// Middleware to log request method, path, and IP
app.use(function (req, res, next) {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip)
  next()
})

setOAuthCredentials(); //loads OAuth credentials if token.json exists
loadConfigVariables(); //loads configuration variables if config.json exists

// Mounting the router object to the app
app.use(routes)

// Getting the port number from the environment file
const { PORT: port } = process.env

// Determine which tunnel to run
const run = process.env.RUN
if (run === 'Dev') { // localTunnel is used to create a custom tunnel, if specified in the environment file
  const { createTunnel } = require('./tunnelHelper/tunnel') // Importing the createTunnel function from the tunnel.js system file

  // Running the app and creating the tunnel
  app.listen(port, () => {
    createTunnel(port) // sends a request to localTunnel which will attempt to get the specified sub-domain from the .env file.
  })
} else {
  app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
  })
}

module.exports = app
