require('dotenv').config();

// Heroku shuts the web role process down, if no http port is listened from the process within 30 seconds
if (process.env.NODE_ENV === 'production') {
    var bot = require('./bot');
    require('./web')(bot);    
} else {
    require('./bot');    
}

