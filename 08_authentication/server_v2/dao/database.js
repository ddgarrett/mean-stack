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
        exports.collections = db.collection('collections');

        log.debug('reading collections collection',thisModule);

        exports.collections.find().toArray(function(err,data){
            if (err) {
                log.fatal(err.message,thisModule);
                throw err;
            }

            for (var i=0; i < data.length; ++i){
                var collectionName = data[i]._id;
                exports[collectionName] = db.collection(collectionName);
            }

            log.info('defined '+data.length+' variable collections',thisModule);

            callback();
        })
    });
};
