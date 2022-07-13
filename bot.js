const config = require('./config.json');
require('dotenv').config()
var token = config.token;

console.log(process.env.NODE_ENV === 'production')

var Bot = require('node-telegram-bot-api');
var bot;

if(process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(config.url + bot.token);
  bot.deleteWebHook();
}
else {
  bot = new Bot(token, { polling: true, webHook: false });
  // bot.deleteWebHook();
}

console.log('bot server started...');

// hello command
bot.onText(/^\/say_hello (.+)$/, function (msg, match) {
  var name = match[1];
  bot.sendMessage(msg.chat.id, 'Hello s ' + name + '!').then(function () {
    // reply sent!
  });
});

// sum command
bot.onText(/^\/sum((\s+\d+)+)$/, function (msg, match) {
  var result = 0;
  match[1].trim().split(/\s+/).forEach(function (i) {
    result += (+i || 0);
  })
  bot.sendMessage(msg.chat.id, result).then(function () {
    // reply sent!
  });
});

module.exports = bot;
