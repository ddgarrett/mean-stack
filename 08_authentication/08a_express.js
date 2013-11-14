var express = require('express');                   // express
var MongoClient = require('mongodb').MongoClient    // MongoDB Client
var app = express();                                // express app

var config = require('./server/config.json');              // Our configuration file
var users = require('./server/users.v3');           // Our Users module
var viewsData = require('./server/views.data.v3');  // Our View Data module
var viewsDef = require('./server/views.def.v1');    // Our View Definition

var cookieSecret = config.cookieSecret;
var sessionSecret = config.sessionSecret;

function errorHandler(err, req, res, next){
    console.log('***** in errorHandler ******');
    if (err) {
        console.dir(err);
        res.json({err: true, message: err.message});
    }
}

function mySessionHandler(req,res, next){
    console.log('in mySessionHandler');
    return next();
}

app.configure(function(){
  app.use(express.logger('dev'))        // Add default logging
     .use(express.json())                            // parse post and put input data
     .use(express.urlencoded())
     .use(express.cookieParser(cookieSecret)) // parse cookies
     .use(express.session())     // use sessions
     .use(express.static(__dirname + '/client'))   // serve static files from /client directory
     .use(mySessionHandler)     // My Session Handler
     .use(app.router)                         // use routes defined below: app.get(...), app.post(...), etc.
     .use(errorHandler)
     ;
});

// Define Routes
app.post('/api/signon', users.signonUser);
app.get('/api/users/:userId', users.getUser);
app.put('/api/users/:userId', users.updateUser);
app.get('/api/users/:userId/views/:viewId/data', viewsData.getViewDataPage);
app.get('/api/users/:userId/views/:viewId/data/count', viewsData.getViewDataCount);
app.get('/api/users/:userId/views/:viewId/data/:dataId', viewsData.getViewDataItem);
app.put('/api/users/:userId/views/:viewId/data/:dataId', viewsData.updateViewDataItem);
app.get('/api/users/:userId/views/:viewId/def', viewsDef.getViewDefinition);

// Start Server
MongoClient.connect(config.mongoDB.connectionString, function(err, db) {
  if(err) throw err;
  config.mongoDB['db'] = db;
  app.listen(config.listenPort);
  console.log('Listening on port ' + config.listenPort);
});










