var express = require('express');
var fs = require('fs');
var buf = new Buffer(256);
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var fileStr = fs.readFileSync('index.html');
  response.send(buf.toString(fileStr));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
