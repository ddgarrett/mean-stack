/*
        Session Manager
 */

var routes = require('./routes.js');
var config = routes.config;
var log = config.log;
var thisModule = 'routes/sessions.js';

var sessionsDao = require(config.dao+'sessions.js');
var utilityDao = require(config.dao+'utility.js');

log.debug('initializing',thisModule);

// Express/Connect - Set req.session param from cookies
// Also sets response cookie
exports.getSession = function(req,res,next){
    log.debug('getSession',thisModule);
    if (!req.signedCookies || !req.signedCookies['sessionId']) return next();

    var sessionId = req.signedCookies['sessionId'];
    sessionsDao.getSession(sessionId,function(err,session){
        if (err) next(err);

        // if session not found, assume that it expired in DB
        if (!session){
            req.session={expired:true};
            res.cookie('sessionId',sessionId,{signed: true});
        }
        else {
            req.session = session;
            res.cookie('sessionId',sessionId,{signed: true});
        }
        next();
    });

};

// Call to start a completely new sessions
exports.startSession = function(userId,req,res,callback){
    log.debug('startSession',thisModule);

    // Set expiration time
    // Requires MongoDB script:
    //   db.sessions.ensureIndex({"expireDate": 1}, {expireAfterSeconds: 0})
    var expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes()+config.sessionExpireMinutes);

    var session = {userId: userId, expireDate: expireDate};
    sessionsDao.insertSession(session, function(err,doc){
        if (err) return callback(err);
        req.session = doc[0];
        var sessionId = req.session._id;
        log.debug('created sessionId: '+sessionId,thisModule);
        res.cookie('sessionId',sessionId,{signed: true});
        callback(null);
    })
};

// Update the session info on MongoDB
// info is in req.session
exports.updateSession = function(req,callback){
    log.debug('updateSession',thisModule);
    if (!req.sesssion) return callback(null);
    sessionsDao.updateSession(req.session,function(err,count){
        if (err) return callback(err);
        if (count === 0)
            return callback(Error('session missing: '+req.session._id));
        log.debug('updated session',thisModule);
        callback(null);
    })
};

// Delete the session and related cookie
exports.deleteSession = function(req,res,callback){
    log.debug('deleteSession',thisModule);
    if (!req.session) callback(null);
    res.cookie('sessionId','',{signed: true});
    sessionsDao.removeSession(session._id,function(err,count){
        if (err) return callback(err);
        if (count === 0)
            return callback(Error('session missing: '+req.session._id));
        log.debug('removed session',thisModule);
        callback(null);
    })
};

// Verify that the user has a valid session
// If userId not passed, user req.param.userId
exports.verifyUserSession = function(req,userId){
    log.debug('verifyUserSession',thisModule);
    if (!userId) userId = req.params.userId;
    userId = utilityDao.parseNumericId(userId);
    return (req.session && req.session.userId === userId);
};

// Required that user has a valid session
// Assumes that userId is in the req.params.userId
exports.requireSession = function(req,res){
    if (exports.verifyUserSession(req,req.params.userId))
        return true;

    if (req.session && req.session.expired)
        config.res.returnSessionExpired(res);
    else
        config.res.returnUserNotFound(res);

    return false
};