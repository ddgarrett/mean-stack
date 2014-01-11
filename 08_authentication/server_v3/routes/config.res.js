/**********************************************
 REST Response related configuration
 ***********************************************/

var config = require('../config.js');  // Configuration file
var log = config.log;   // Our logging related configurations
var thisModule = 'config.res.js';

exports.returnNotFound = function(res,message){
    log.info('Not found - '+message,thisModule);
    res.status(404);
    exports.returnError(res,message);
};

exports.returnUserNotFound = function(res){
    exports.returnNotFound(res,'user not found');
};

exports.returnSessionExpired = function(res){
    var errMsg = 'user not found';
    res.status(404);
    res.json({err: true, errMsg: errMsg, sessionExpired: true});
};

exports.returnError = function(res,message){
    log.info('Error - ' + message,thisModule);
    res.json({err:true, errMsg:message});
};

exports.returnOkayMessage = function(res,message){
    log.debug('okay - '+message,thisModule);
    res.json({err:false, errMsg:message});
};

// Express/Connect Error Handler
exports.errorHandler = function(err, req, res, next){
    log.fatal(err,thisModule);
    if (err) {
        exports.returnError(err);
    }
};

