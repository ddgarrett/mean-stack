/**
    Define Routes
 */
var config = require('../config.js');  // Configuration file
exports.config = config;

var log = config.log;
var thisModule = 'routes/routes.js';
log.debug('initializing',thisModule);

var users      = require('./users.js');
var viewsData  = require('./viewsData.js');
var viewsDef   = require('./viewsDef.js');

exports.defineRoutes = function(app){
    log.debug('defining routes',thisModule);

    // Define Routes
    app.post('/api/signon', users.signon);
    app.get('/api/users/:userId', users.getUser);
    app.put('/api/users/:userId', users.updateUser);

    app.get('/api/users/:userId/views/:viewId/data', viewsData.getViewDataPage);
    app.get('/api/users/:userId/views/:viewId/data/count', viewsData.getViewDataCount);
    app.get('/api/users/:userId/views/:viewId/data/:dataId', viewsData.getViewDataItem);
    app.put('/api/users/:userId/views/:viewId/data/:dataId', viewsData.updateViewDataItem);

    app.get('/api/users/:userId/views/:viewId/def', viewsDef.getViewDefinition);
};
