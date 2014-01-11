/**
        REST get and update Users
 */

var routes = require('./routes.js');
var config = routes.config;
var log = config.log;
var usersDao = require(config.dao+'users');
var utilityDao = require(config.dao+'utility');

var thisModule = 'routes/users.js';
log.debug('initializing',thisModule);

// Signon User - stub for now
exports.signon = function(req,res,next){
    var email = req.body.email;
    var password = req.body.password;
    log.debug('signon user '+email,thisModule);
    usersDao.verifyUserSignon(email,password,function(err,user){
        if (err) return next(err);
        if (user === null)
            return config.res.returnNotFound(res,'user not found');

        res.json(user);
    });
};

// Read a User as defined by :userId
exports.getUser = function(req,res,next){
    log.debug('getting user '+req.params.userId,thisModule);
    usersDao.getUser(req.params.userId,function(err,user){
        if (err) return next(err);
        if (user === null)
            return config.res.returnNotFound(res,'user not found');

        res.json(user);
    });
};

exports.updateUser = function(req,res,next){
    log.debug('update user '+req.params.userId,thisModule);
    var data = req.body;
    data['_id'] = utilityDao.parseNumericId(req.params.userId);
    usersDao.updateUserProfile(data, function(err,editMessage,updateCount){
        if (err)
            return next(err);
        if (editMessage)
            return config.res.returnError(res,editMessage);
        if (updateCount === 0)
            return config.res.returnNotFound(res,'user not found');

        config.res.returnOkayMessage(res,'user updated');
   });
};
