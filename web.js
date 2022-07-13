var express = require('express');
var packageInfo = require('./package.json');
var bodyParser = require('body-parser');
const config = require('./config.json');

var app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';

var server = app.listen(server_port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Web server started at http://%s:%s', server_host, port);
});

module.exports = function (bot) {
  app.post('/' + bot.token, function (req, res) {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};
