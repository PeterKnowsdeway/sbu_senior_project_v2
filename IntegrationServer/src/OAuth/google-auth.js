const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const router = express.Router();
const redis = require('redis');
const client = redis.createClient();

console.log('I made it to google-oauth.js');

let { configVariables } = require('../config/config-helper.js');

const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BACK_TO_URL
);

// Declares the necessary scopes from Google
const SCOPES = ['https://www.googleapis.com/auth/contacts'];

google.options({ auth: OAuth2Client });

/**
 *
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The a redirect to URL to the Google OAuth2 page, or a redirect back to Monday.com.
 */
async function setUpOAuth(req, res) {
  console.log('I made it to setUpOauth.js');
  const TOKEN_PATH = './token.json';
  fs.promises
    .access(TOKEN_PATH, fs.constants.F_OK)
    .then(() => {
      fs.promises
        .readFile(TOKEN_PATH)
        .then((token) => {
          OAuth2Client.credentials = JSON.parse(token);
          const returnUrl = req.session.backToUrl;
          return res.redirect(returnUrl);
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).send();
        });
    })
    .catch(() => {
      client.set('returnURl', req.session.backToUrl);
      try {
        const url = OAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
        });
        return res.redirect(url);
      } catch (err) {
        console.error('The URL could not be generated', err);
        return res.status(500).send();
      }
    });
}

async function codeHandle(req, res) {
  //Creates a new token or detects if a token already exists
  console.log('I made it to token-store-permissions.js');
  client.get('returnURl', (err, backToUrl) => {
    if (backToUrl == undefined) {
      return res.status(200).send({});
    } else {
      client.del('returnURl');
      const TOKEN_PATH = './token.json';
      fs.promises
        .access(TOKEN_PATH, fs.constants.F_OK)
        .then(() => {
          fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return console.error(err);
            OAuth2Client.credentials = JSON.parse(token);
            return res.redirect(backToUrl);
          });
        })
        .catch(() => {
          const code = req.query['code'];
          console.log(code);
          OAuth2Client.getToken(code, (err, token) => {
            if (err)
              return console.error('Error retrieving access token', err);
            OAuth2Client.credentials = token;
            console.log(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) return console.error(err);
              console.log('Token stored to', TOKEN_PATH);
            });
          });
          return res.redirect(backToUrl);
        });
    }
  });
}

module.exports = {
  codeHandle,
  setUpOAuth,
  OAuthClient: OAuth2Client,
};


