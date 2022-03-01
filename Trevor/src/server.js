require('dotenv').config(); //required for us to use process.env
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const routes = require('./routes');
//leads to the routes folder, each "route" in the route folder signifies a seperate piece of the functionality of the program
//So each .js file in the routes folder controls a different aspect of the functionality.

const { createTunnel } = require('./tunnelHelper/tunnel');
//get the createTunnel function for use in, you quessed it, creating a tunnel. 

const port = process.env.PORT;
//get the prot from the .evn file

const { sendAuthUrl } = require('./middleware/auth-sender');


app.use(bodyParser.json()) //this is so we can deal with JSON info in POST requests

app.use(function (req, res, next) {
    //Creates a new token or detects if a token already exists
    const client_id = "232811749250-phji8o1bmnd86b3vff1uetdkp12138vi.apps.googleusercontent.com";
    const client_secret = "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";
    const redirect_uri = "http://localhost:3000";
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uri);
    //Creates a token from the recieved auth code
    if (!("./token.json")) {
        const TOKEN_PATH = "./token.json"
        const code = req.query['code'];
        console.log(code);

        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            console.log(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
                oAuth2Client.setCredentials(token);
            });

            // Store the token to disk for later program executions
            //callback(oAuth2Client);
        });
        next();
    }

app.use(routes); //tells the app to handle requests using the .js files in routes



//Tell the app to listen at port, and then create a tunnel.
app.listen(port, () => {
  createTunnel(port);
});


module.exports = app;
sendAuthUrl;