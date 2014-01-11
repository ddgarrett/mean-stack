/*
        Module to define configuration parameters
        and functions.
 */

var log = require('./utility/config.logger.js');    // Our logging related configurations
exports.log = log;

exports.db = require('./dao/config.db.js');        // Our Database related configurations
exports.res = require('./routes/config.res.js');   // Our routes, request/response related configuration

// location of static pages
exports.staticPageDir = __dirname + '/../client_v01';
log.debug('setting static page to '+exports.staticPageDir,'config.js');

// HTTP log level
exports.httpLogLevel = 'dev';

// IP Address and Port server should listen on
exports.ipaddress   = process.env.OPENSHIFT_NODEJS_IP   || undefined; // listen to more than just localhost
exports.listenPort  = process.env.OPENSHIFT_NODEJS_PORT || 3000;

// cookie secret
exports.cookieSecret = '4f4506b017a697adea71186f0691d79691324240';

// Number of minutes a session lives
exports.sessionExpireMinutes = 60 * 24 * 7;  // expire sessions in 7 days

// file paths to dao, routes, utility directories
exports.dao =  __dirname + '/dao/';
exports.routes =  __dirname + '/routes/';
exports.utility =  __dirname + '/utility/';

log.debug('dao directory: '+exports.dao,'config.js');
log.debug('routes directory: '+exports.routes,'config.js');
log.debug('utility directory: '+exports.utility,'config.js');


