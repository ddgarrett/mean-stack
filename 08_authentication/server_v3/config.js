/*
        Module to define configuration parameters
        and functions.
 */

var log = require('./util/config.logger.js');      // Our logging related configurations
exports.log = log;

exports.db = require('./dao/config.db.js');        // Our Database related configurations
exports.res = require('./routes/config.res.js');   // Our routes, request/response related configuration

// location of static pages
exports.staticPageDir = __dirname + '/../client';
log.debug('setting static page to '+exports.staticPageDir,'config.js');

// HTTP log leve
exports.httpLogLevel = 'dev';

// Port server should listen on
exports.listenPort = 3000;

// cookie secret
exports.cookieSecret = '4f4506b017a697adea71186f0691d79691324240';

// Number of minutes a session lives
exports.sessionExpireMinutes = 60 * 24;  // expire sessions in 1 day

// file paths to dao, routes, utility directories
exports.dao =  __dirname + '/dao/';
exports.routes =  __dirname + '/routes/';
exports.util =  __dirname + '/util/';

log.debug('dao directory: '+exports.dao,'config.js');
log.debug('routes directory: '+exports.routes,'config.js');
log.debug('util directory: '+exports.util,'config.js');


