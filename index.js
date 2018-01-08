var express = require('express'),
    mongoose = require('mongoose'),
    url = require('url'),
    valid = require('valid-url'),
    app = express();

var mongoDB = process.env.MONGOLAB_URI;
mongoose.connect(mongoDB, {
  useMongoClient: true
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;
var urlSchema = new Schema({
  uri: String,
  id: Number
});

var UrlModel = mongoose.model('UrlModel', urlSchema);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
}).listen(process.env.PORT);


app.get(/\/new\/*/, function(req, res){ 
  var site = url.parse(req.url).pathname.slice(5)
  if (valid.isUri(site)){
    UrlModel.find({}, function(err, url){
      if (err) throw err;
      var add = new UrlModel({
        uri: site,
        id: 1000 + url.length
      });
      add.save(function(err){
        if(err) throw (err);
        res.json({ 'original url': site, 'shorterURL': 'https://shorterurl.glitch.me/' + add.id});
      });
    });
    
  } else {
        res.json({ 'error': 'Wrong URL format - please use a valid protocol and a real website - refer to example usage on homepage'});
    }
});

app.get(/\/*/, function(req, res){
  var path = url.parse(req.url).pathname.slice(1);
  if (+path) {
    UrlModel.find({ id: +path }, function(err, result){
      if (err) throw err;
      if (result.length) {
        var redirect = result[0]['uri']
        res.redirect(redirect);
      } else {
        res.json({ 'error': 'this URL is not in the database' });
      }

    });
  } else {
    res.json({ 'error': 'this URL is not in the database' });
  }
});

