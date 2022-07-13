const https = require('https');
const config = require('./config.json');

const options = {
    hostname: (new URL(config.url)).hostname,
    method: 'GET'
}

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
});

req.end();