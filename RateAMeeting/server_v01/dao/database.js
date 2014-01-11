/*
    Project Specific Database Object

    Establishes a database connection,
    Initializes variables for collections.

 */

var config = require('../config.js');  // Configuration file
exports.config = config;
var log = config.log;
var thisModule = 'dao/database.js';
log.debug('initializing',thisModule);


// Connect to database
exports.connectToDatabase = function(callback){
    log.debug('getting database',thisModule);

    config.db.getDatabase(function(err, db) {
        if (err) throw err;

        exports.db = db;

        // primary system collections
        exports.users = db.collection('users');
        exports.views = db.collection('views');
        exports.meetings = db.collection('meetings');
        exports.sessions = db.collection('sessions');
        exports.feedback = db.collection('feedback');

        callback();
    });
};