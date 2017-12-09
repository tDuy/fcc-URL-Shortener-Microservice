// server.js

// init project
var mongo = require('mongodb').MongoClient;
var express = require('express');
var app = express();

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/new/*', (req, res) => {
  //check valid url
  var url = req.params[0];
  if(/^http[s]?:\/\/(www\.)?\w+\.\w+/.test(url)){
    // valid link, add to urls collection
    mongo.connect(process.env.MLAB_URI, (err, db) => {
      if(err)
        throw err;
      var collection = db.collection('urls');
      
      collection.count().then( c => {
        if(err)
          throw err;
        var new_url = 'https://plain-scraper.glitch.me/' + (c+1);
        var obj = {ori_url: url, short_url: new_url};
        collection.insert(obj);
        db.close();
        res.send({ori_url: obj.ori_url, short_url: obj.short_url});  
      });   
    });
    
  //invalid link
  } else {
      var obj = {"error":"Wrong url format, make sure you have a valid protocol and real site."}; 
      res.send(obj);
  }
});

app.get('/:id(\\d+)', (req, res) => {
  var sh_url = 'https://plain-scraper.glitch.me/' + req.params.id;

  mongo.connect(process.env.MLAB_URI, (err, db) => {
    if(err)
      throw err;
    db.collection('urls')
      .find({short_url: sh_url})
      .limit(1)
      .toArray((err, doc) => {
        if(err)
          throw err;
        let url = doc[0];
        db.close();
        res.redirect(url.ori_url);
       });
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
