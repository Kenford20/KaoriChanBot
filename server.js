const express = require('express');
const packageInfo = require('./package.json');

const app = express();

app.get('/', function(req, res) {
  res.send('Konnichiwa! Kaori-chan bot lives here! :)')
  res.send('https://github.com/Kenford20/my-telegram-bot')
});

const server = app.listen(process.env.PORT, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Web server started at http://%s:%s', host, port);
});