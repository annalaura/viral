var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var events = require('./events.js');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('index', {title: 'Viral'});
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});

MongoClient.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/viral', function(err, db) {
  if (err) {
    throw err;
  }
  console.log('connected correctly to server');
  events.attach(http, db);
});
