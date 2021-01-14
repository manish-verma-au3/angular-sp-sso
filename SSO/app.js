var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var index = require('./routes/index')
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', index);
var port = process.env.APP_PORT || 4000
app.listen(port)
console.log('SP listening on port ' + port)