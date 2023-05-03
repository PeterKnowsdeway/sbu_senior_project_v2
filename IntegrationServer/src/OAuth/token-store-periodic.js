const fs = require('fs');
const {google} = require('googleapis');
const OAuth2Client = require('./google-auth.js').OAuthClient
google.options({auth: OAuth2Client});

function useAccessToken() {
	if(!(Object.keys(OAuth2Client.credentials).length === 0)) {
		var service = google.people({ version: 'v1', auth: OAuth2Client });
		service.people.connections.list({
			pageSize:1,
			resourceName: 'people/me',
			personFields: 'metadata'
		}, (err, res) => { 
			if (err) return console.error('The API returned an error: ' + err)
			updateToken()
		});
	}	else {
		console.log('No credentials set for access token update');
	}
}

// Checks if the token.json file exists, if it does, it reads the file and compares it to the
// current credentials, if they are different, it writes the new credentials to the file.
function updateToken(){
	credentials = JSON.stringify(OAuth2Client.credentials)
	if(fs.existsSync("./token.json")) {
		fs.readFile("./token.json", (err, token) => {
			if (err) return console.error(err);
			if(!(token == credentials)) {
				fs.writeFile("./token.json", credentials, { flag: 'w' }, (err) => {
					if (err) return console.error(err);
					console.log('Cached token updated');
				});
			}
			else {
				console.log('No updated to cached token');
			}	
    });
	}
	console.log("Update Cached token attemped");
}

module.exports = {
	updateToken,
  useAccessToken
};


//look in ouath client for credentials, if they exist, override whtat is token.json