/**
 * This file contains the code that is used to set up the OAuth2 connection with Google.
 * It is used to redirect the user to the Google OAuth2 page, and to handle the code that is returned.
 */

const { google } = require('googleapis');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const { client, asyncGet, asyncDel } = require('../middleware/redis.js');

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
  const TOKEN_PATH = './token.json';
  try {
    const token = await asyncGet(TOKEN_PATH);
    OAuth2Client.credentials = JSON.parse(token);
    const returnUrl = req.session.backToUrl;
    return res.redirect(returnUrl);
  } catch (err) {
    console.error(err);
    client.set('returnURl', req.session.backToUrl);
    try {
      const url = OAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      return res.redirect(url);
    } catch (err) {
      console.error('The URL could not be generated', err);
      return res.status(500).send(err.message);
    }
  }
}

async function codeHandle(req, res) {
  try {
    const backToUrl = await asyncGet('returnURl');
    if (!backToUrl) {
      return res.status(400).send('backToUrl is not set');
    } else {
      await asyncDel('returnURl');
      const TOKEN_PATH = './token.json';
      try {
        await fs.promises.access(TOKEN_PATH, fs.constants.F_OK);
        const token = await fs.promises.readFile(TOKEN_PATH);
        OAuth2Client.credentials = JSON.parse(token);
        return res.redirect(backToUrl);
      } catch (err) {
        const code = req.query['code'];
        console.log(code);
        try {
          const { tokens } = await OAuth2Client.getToken(code);
          OAuth2Client.credentials = tokens;
          console.log(tokens);
          await fs.promises.writeFile(TOKEN_PATH, JSON.stringify(tokens));
          console.log('Token stored to', TOKEN_PATH);
          return res.redirect(backToUrl);
        } catch (err) {
          console.error('Error getting token:', err.message);
          return res.status(500).send();
        }
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
}

module.exports = {
  codeHandle,
  setUpOAuth,
  OAuthClient: OAuth2Client,
};
