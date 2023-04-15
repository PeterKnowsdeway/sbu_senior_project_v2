const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const router = express.Router();
const redis = require('redis');
const client = redis.createClient(); //TODO: include proper error checking using try-catch blocks or other mechanisms

console.log('I made it to google-oauth.js');

const { configVariables } = require('../config/config-helper.js');

const OAuth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.BACK_TO_URL)
	  //'232811749250-phji8o1bmnd86b3vff1uetdkp12138vi.apps.googleusercontent.com', //YOUR_CLIENT_ID
	  //'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', //YOUR_CLIENT_SECRET
	  //'http://localhost:3000/tokenHandle') //backToUrl


// Declares the necessary scopes from Google
const SCOPES = ['https://www.googleapis.com/auth/contacts'];

// The path to the token file
const TOKEN_PATH = "./token.json";

// The key for the return URL in the cache
const RETURN_URL_KEY = "returnURl";

google.options({ auth: OAuth2Client });

/**
 * @param req - The request object.
 * @param res - The response object.
 * @returns The a redirect to URL to the Google OAuth2 page, or a redirect back to Monday.com.
 */
async function setUpOAuth (req, res) {	
  fs.promises.access(TOKEN_PATH, fs.constants.F_OK)
  .then(() => {
    fs.promises.readFile(TOKEN_PATH)
      .then(token => {
        OAuth2Client.credentials = JSON.parse(token);;
        const returnUrl = req.session.backToUrl;
        return res.redirect(returnUrl);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send();
      });
  })
  .catch(() => {
    client.set(RETURN_URL_KEY, req.session.backToUrl, (err, reply) => {
      if(err) {
        console.error(err);
        return res.status(500).send();
      }
    });
    try {
      const url = OAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
      });
      return res.redirect(url);
    } catch (err) {
      console.error("The URL could not be generated", err);
      return res.status(500).send();
    }
  }); 
}

/*
 * This function is called when the user is redirected back to the server
 * after authenticating with Google.
 *
 * It takes the code from the query string, gets an access token from Google,
 * and then redirects the user back to the page they were on before.
 */
async function codeHandle (req, res) {
  client.get(RETURN_URL_KEY, (err, backToUrl) => {
    if(err) {
      console.error(err);
      return res.status(500).send();
    }
    if(backToUrl == undefined) {
      return res.status(200).send({});
    }
    client.del(RETURN_URL_KEY, (err, reply) => {
      if(err) {
        console.error(err);
        return res.status(500).send();
      }
    });	
    fs.promises.access(TOKEN_PATH, fs.constants.F_OK)
    .then(() => {
      fs.promises.readFile(TOKEN_PATH)
        .then(token => {
          OAuth2Client.credentials = JSON.parse(token);
          return res.redirect(backToUrl);
        })
        .catch(err => {
          console.error(err);
          return res.status(500).send();
        });
    })
    .catch(() => {
      const code = req.query["code"];
      console.log(code);
      OAuth2Client.getToken(code)
        .then(token => {
          OAuth2Client.credentials = token;
          console.log(token);
          fs.promises.writeFile(TOKEN_PATH, JSON.stringify(token))
            .then(() => {
              console.log("Token stored to", TOKEN_PATH);
              return res.redirect(backToUrl);
            })
            .catch(err => {
              console.error(err);
              return res.status(500).send();
            });
        })
        .catch(err => {
          console.error("Error retrieving access token", err);
          return res.status(500).send();
        });
    });
  });
}

module.exports = {
	codeHandle,
	setUpOAuth,
	'OAuthClient': OAuth2Client
};


