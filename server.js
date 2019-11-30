'use strict';


var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns')
var cors = require('cors');
var shortUrl = require('./model/shortUrl.js')


var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser:true,
                                           useUnifiedTopology: true});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.post("/api/shorturl/new", (req, res) => {
  var url = req.body.url;
  let fixRegex = new RegExp("^(https://|http://)");
  url = url.replace(fixRegex, "");

  dns.lookup(url, (err)=> {
    if(err){
      return res.json({"error":"invalid URL"})
    } else {
      var short = Math.floor(Math.random()*100000).toString();
                   var data = new shortUrl({
                     originalUrl: url,
                     shorterUrl: short
            })
                   data.save((err)=> {
                if(err) {
                    console.log("Error saving to Data Base")
                    return res.send("Error saving to Data Base")
                } else {
                  console.log('data was saved')
                }
            })
      var jsonObj = {"original_url": data.originalUrl, "short_url":data.shorterUrl}
      res.send(jsonObj)
    }
  })
  });

//your second endpoint

app.get('/api/shorturl/:urlToForward', (req,res,next)=> {
  var shorterUrl = req.params.urlToForward;
  shortUrl.findOne({'shorterUrl':shorterUrl}, (err, data) => {
    if(err){
      return res.send('Error reading database')
    } else {
      var re = new RegExp("^(http|https)://", "i");
      var strToCheck = data.originalUrl;
      if(re.test(strToCheck)) {
        res.redirect(301, data.originalUrl)
      } else {
        res.redirect(301, 'https://' + data.originalUrl);
      }
    }
  })
})






app.listen(port, function () {
  console.log('Node.js listening ...');
});

module.exports = app;
