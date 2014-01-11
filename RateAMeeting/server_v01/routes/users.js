/**
        REST get and update Users
 */

var routes = require('./routes.js');
var config = routes.config;
var log = config.log;
var sessions = require('./sessions.js');

var usersDao = require(config.dao+'users.js');
var utilityDao = require(config.dao+'utility.js');

var thisModule = 'routes/users.js';
log.debug('initializing',thisModule);

// Add a new user
exports.addNewUser = function(req,res,next){
    log.debug('add user '+req.body.email,thisModule);
    usersDao.addUser(req.body,function(err,editMessage,user){
        if (err) return next(err);
        if (editMessage)  return config.res.returnError(res,editMessage);

        sessions.startSession(user._id,req,res,function(err){
            if (err) return next(err);
            res.json(user);
        });
    });
};

// Sign On User - stub for now
exports.signOn = function(req,res,next){
    var email = req.body.email;
    var password = req.body.password;
    log.debug('sign on user '+email,thisModule);
    usersDao.verifyUserSignon(email,password,function(err,user){
        if (err) return next(err);
        if (user == null)
            return config.res.returnError(res,'invalid email or password');

        sessions.startSession(user._id,req,res,function(err){
            if (err) return next(err);
            res.json(user);
        });
    });
};

// Sign off user - delete session
exports.signOff = function(req,res,next){
    log.debug('sign off user',thisModule);
    sessions.deleteSession(req,res,function(err){
        if (err) return next(err);
        res.json({message: 'user signed off'})
    })
};

// Read a User as defined by :userId
exports.getUser = function(req,res,next){
    sessions.defaultUserFromSession(req);
    log.debug('getting user '+req.params.userId,thisModule);
    if (!sessions.requireSession(req,res)) return;

    usersDao.getUser(req.params.userId,function(err,user){
        if (err) return next(err);
        if (user === null)
            return config.res.returnNotFound(res,'user not found');

        res.json(user);
    });
};

exports.updateUser = function(req,res,next){
    sessions.defaultUserFromSession(req);
    log.debug('update user '+req.params.userId,thisModule);
    if (!sessions.requireSession(req,res)) return;

    var data = req.body;
    data._id = req.params.userId;

    usersDao.updateUserProfile(data, function(err,editMessage,updateCount){
        if (err)
            return next(err);
        if (editMessage)
            return config.res.returnError(res,editMessage);
        if (updateCount === 0)
            return config.res.returnUserNotFound(res);

        // update okay - return updated user
        exports.getUser(req,res,next);
   });
};
