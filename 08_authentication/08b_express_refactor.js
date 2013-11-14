var express = require('express');             // express
var app = express();                          // express app

var thisModule = '08b_express_refactor';

var configFile = './server_v2/config.js';   // Version 2 of Server Configuration
var config = require(configFile);           // Our configuration module
var log = config.log;

log.info('starting server with config in '+configFile,thisModule);

var db     = require(config.dao+'database.js');  // Our database module
var routes = require(config.routes+'routes.js'); // Our server routes

log.debug('defining app configuration',thisModule);

app.configure(function(){
    log.debug('app.configure function called',thisModule);

    app.use(express.logger('dev'))                     // Add default logging
       .use(express.json())                            // parse post and put input data
       .use(express.urlencoded())
       .use(express.cookieParser(config.cookieSecret)) // parse cookies
       .use(app.router)                                // use routes defined below: app.get(...), app.post(...), etc.
       .use(express.static(config.staticPageDir))      // serve static files
       .use(config.res.errorHandler)                   // handle errors
    ;
});

log.debug('starting server',thisModule);

// Connect to Database and Start Server
db.connectToDatabase(function() {
    routes.defineRoutes(app);
    app.listen(config.listenPort);
    log.info('Listening on port ' + config.listenPort,thisModule);
});










