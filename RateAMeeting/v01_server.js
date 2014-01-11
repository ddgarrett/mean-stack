var express = require('express');           // express
var app = express();                        // express app

var thisModule = 'v01_server';              // Version 1 of Server Configuration
var configFile = './server_v01/config.js';

var config = require(configFile);          // Our configuration module
var log = config.log;

log.info('starting server with config in '+configFile,thisModule);

var db     = require(config.dao+'database.js');      // Our database module
var routes = require(config.routes+'routes.js');     // Our server routes
var sessions = require(config.routes+'sessions.js'); // Our sessions module

log.debug('defining app configuration',thisModule);

app.configure(function(){
    log.debug('app.configure function called',thisModule);

    app.use(express.logger(config.httpLogLevel))       // Add default logging
       .use(express.static(config.staticPageDir))      // serve static files
       .use(express.json())                            // parse post and put input data
       .use(express.urlencoded())
       .use(express.cookieParser(config.cookieSecret)) // parse cookies
       .use(sessions.getSession)                       // our custom session handler
       .use(app.router)                                // use routes in routes.defineRoutes
       .use(config.res.errorHandler)                   // out custom handle errors
    ;
});

log.debug('starting server',thisModule);

// Connect to Database and Start Server
db.connectToDatabase(function(){
    routes.defineRoutes(app);
    app.listen(config.listenPort,config.ipaddress);
    log.info('Listening on port ' + config.listenPort,thisModule);
});










