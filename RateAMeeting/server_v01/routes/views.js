/**
        REST get Views
 */

var routes = require('./routes.js');
var config = routes.config;
var log = config.log;
var sessions = require('./sessions.js');

// TODO: create view DAO (unless we hard code views here?)

// var usersDao = require(config.dao+'views.js');
var utilityDao = require(config.dao+'utility.js');

var thisModule = 'routes/views.js';
log.debug('initializing',thisModule);

// Get a meeting page
exports.getViewDefinition = function(req,res,next){
};
