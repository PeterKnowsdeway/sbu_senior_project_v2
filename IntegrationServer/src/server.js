require('dotenv').config(); 
var express = require('express'); 
var bodyParser = require('body-parser'); 
var app = express();
const cors = require('cors');

const swaggerUI = require("swagger-ui-express")
const swaggerJsDoc = require("swagger-jsdoc")

const routes = require('./routes'); //Import all of the exported router objects from the routes folder into this file.
//Telling the app to "listen at" with routes passed in will enable all the defined endpoints.
const {setOAuthCredentials} = require('./startup-helper.js');
const {loadConfigVariables} = require('./startup-helper.js');

//require file to make it's code run upon startup.
require('./OAuth/token-store-periodic.js'); //temporary access token refresher - schedules itself to run periodically when loaded, to keep the access token from expiring

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Contacts Integration API",
      version: "2.0.0",
      description: "A contacts integration between Monday.com and Google Contacts"
    },
    servers: [
      {
        url: "https://sbuseniorprojectv2.peterwelter.repl.co/"
      }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsDoc(options)

app.use('/swagger', swaggerUI.serve, swaggerUI.setup(specs));

app.use(bodyParser.json()) //Have all requests filtered through bodyParser so that the body of all the POST requests sent to the API to be read and used. 
app.use(cors());
//Print the method, path, and ip of all requests. This will act as middleware that all requests are filtered through.
app.use(function(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  //console.log(req.query);
  next();
});


//run startup functions
setOAuthCredentials(); //IF token.json exists (aka OAuth Credentials), load them.
loadConfigVariables(); //IF config.json exists, load them.

app.use(routes); //Tells the app to mount the paths contained in the router object imported from routes/index.js

const { PORT: port } = process.env; //get port number from environment file.

const run = process.env.RUN; //determine which tunnel to run
if(run == "Dev") { //custom tunnel - currently set for loca.lt (localTunnel; not actually local). Loca.lt is NOT reliable for sub-domain.
  const {createTunnel} = require('./tunnelHelper/tunnel'); //requires tunnel.js system file's createTunnel function for tunnel creation
  
  app.listen(port, () => {
    createTunnel(port); //see tunnelHelper/tunnel.js - this sends a request to loca.lt which will attempt to get the .env specified sub-domain.
  });

} else { //replit
  app.listen(port, () => { 
    console.log(`Listening on port: ${port}`); 
  });
}

module.exports = app; //module.exports is a node.js thing which is needed for express to trigger endpoints?