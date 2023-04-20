/**
 * This file contains the code that is used to set up the OAuth2 connection with Google.
 * It is used to redirect the user to the Google OAuth2 page, and to handle the code that is returned.
 */

const { google } = require('googleapis')
const fs = require('fs')
const { client, asyncGet, asyncDel, asyncSet } = require('../middleware/redis.js')

const OAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BACK_TO_URL
)

// Declares the necessary scopes from Google
const SCOPES = ['https://www.googleapis.com/auth/contacts']

google.options({ auth: OAuth2Client })

const TOKEN_PATH = "./token.json"

/**
 *
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The a redirect to URL to the Google OAuth2 page, or a redirect back to Monday.com.
 */
async function setUpOAuth (req, res) {	
	if (fs.existsSync(TOKEN_PATH)) {
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
				    console.error(err);
				    return;
			  }
        OAuth2Client.credentials = JSON.parse(token);;
			  let returnUrl = req.session.backToUrl;
			  return res.redirect(returnUrl);
    });
	} else {
	    asyncSet("returnURl", req.session.backToUrl);
	    let url = OAuth2Client.generateAuthUrl({
          // 'online' (default) or 'offline' (gets       refresh_token)
		      access_type: 'offline',
          // If you only need one scope you can pass it as a string
		      scope: SCOPES	
	    });
	    return res.redirect(url);
	  }
  }

async function codeHandle (req, res) {
    const backToUrl = await asyncGet("returnURl");
    if(!backToUrl) 
      return res.status(200).send({});
    else {
        asyncDel("returnURl");   
        if (!(fs.existsSync(TOKEN_PATH))) {
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
            //Store the token to disk for later program executions
        });
        return res.redirect(backToUrl);
    }
    //If the token exists, sets up OAuth2 client
    else {
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return console.error(err);
            OAuth2Client.credentials = JSON.parse(token);
        });
        return res.redirect(backToUrl);
    }
  }
}

module.exports = {
    codeHandle,
    setUpOAuth,
    'OAuthClient': OAuth2Client
};