/**
        Module to define configuration parameters
        and functions.
 */

// Our logging related configurations
var log = require('./util/config.logger.js');
exports.log = log;

// Our Database related configurations
var db = require('./dao/config.db.js');
exports.db = db;

// Our routes, req/res related config
var res = require('./routes/config.res.js');
exports.res = res;

// location of static pages
exports.staticPageDir = __dirname + '/../client';
log.debug('setting static page to '
              +exports.staticPageDir,'config.js');

// Port server should listen on
exports.listenPort = 3000;

// cookie secret
exports.cookieSecret
    = 'bzyhf61n3MgvnYir9+V6CPzPTbjxHTAIuJkEroPcghY=';

// file paths to dao, routes, utility directories
exports.dao =  __dirname + '/dao/';
exports.routes =  __dirname + '/routes/';
exports.util =  __dirname + '/util/';

log.debug('dao directory: '+exports.dao,'config.js');
log.debug('routes directory: '+exports.routes,'config.js');
log.debug('util directory: '+exports.util,'config.js');





