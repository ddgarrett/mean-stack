/**
 *  Sessions access and update.
 *  Session has whatever data caller wants to place in the document.
 */

var db = require('./database.js');  // database connection and collection cursors
var utilityDao = require('./utility.js');

var config = db.config;
var log = config.log;
var hash = require(config.utility+'hash.js');

var thisModule = 'dao/sessions.js';
log.debug('initializing',thisModule);

// Generate a new ID and insert the session
// Since the generated secure ID is not guaranteed to be unique
// if we have a duplicate ID error on insert, we try again
exports.insertSession = function(doc,callback){
    log.debug('insert session',thisModule);
    doc._id = hash.generateSecureId();
    db.sessions.insert(doc,{w:1},function(err,session){
        // If duplicate _id error, try again
        if (err && err.code === 11000){
            log.info('duplicate session id: '+ session.id,thisModule);
            return exports.insertSession(doc,callback);
        }
        callback(err,session);
    });
};

// Get a session
exports.getSession = function(sessionId,callback){
    log.debug('get session',thisModule);
    db.sessions.findOne({_id: sessionId},callback);
};

exports.updateSession = function(doc,callback){
    log.debug('get session',thisModule);
    db.sessions.update(doc,callback);
};

exports.removeSession = function(sessionId,callback){
    log.debug('remove session',thisModule);
    db.sessions.remove({_id:sessionId},{w:1},callback);
};



