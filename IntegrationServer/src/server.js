/**
  * This loads all of the necessary dependencies and routes, sets up the application to listen on a specified port, and runs a startup script to initialize variables.
  * @module
*/
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const schedule = require('node-schedule')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')

const routes = require('./routes')
const { setOAuthCredentials, loadConfigVariables } = require('./startup-helper.js')
const { getNewToken } = require('./OAuth/google-auth.js')
const { serve, setup } = require('swagger-ui-express')
const { createTunnel } = require('./tunnelHelper/tunnel')

const app = express()
const port = process.env.PORT

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
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsDoc(options);

app.use('/api-docs', serve, setup(specs));
app.use('/coverage', express.static('./coverage'));
app.use('/docs', express.static('./docs'));
app.use(bodyParser.json());
app.use(cors());
// Compress all requests
app.use(compression())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

const initializeApp = async () => {
  try {
    await Promise.all([setOAuthCredentials(), loadConfigVariables()]);
    schedule.scheduleJob('0 * * * *', getNewToken);
    app.use(routes);
    const run = process.env.RUN;
    if (run === 'Dev') {
      await app.listen(port);
      createTunnel(port);
    } else {
      app.listen(port, () => {
        console.log(`Listening on port: ${port}`);
      });
    }
  } catch (error) {
    console.error('Error loading credentials or config variables:', error);
  }
};

initializeApp();

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
