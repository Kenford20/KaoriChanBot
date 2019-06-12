const express = require('express');
const packageInfo = require('./package.json');

const app = express();

app.get('/', function(req, res) {
  res.send(`
    <h1>Konnichiwa! Kaori-chan bot lives here! :)</h1>\n
    <h2>You can view her code <a href="https://github.com/Kenford20/my-telegram-bot">here!</a></h2>
  `)
});

const server = app.listen(process.env.PORT, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Web server started at http://%s:%s', host, port);
});