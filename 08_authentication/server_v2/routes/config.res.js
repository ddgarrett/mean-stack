/**********************************************
 REST Response related configuration

 May need to be configured for a particular
 client.
 ***********************************************/

var config = require('../config.js');  // Configuration file
var log = config.log;                  // Our logging related configurations
var thisModule = 'config.res.js';
log.debug('initializing',thisModule);

exports.returnNotFound = function(res,message,thisModule){
    log.info('Not found - '+message,thisModule);
    res.status(404);
    exports.returnError(res,message);
};

exports.returnError = function(res,message,thisModule){
    log.info('Error - ' + message,thisModule);
    res.json({err:true, errMsg:message});
};

exports.returnOkayMessage = function(res,message,thisModule){
    log.debug('okay - '+message,thisModule);
    res.json({err:false, errMsg:message});
};

exports.errorHandler = function(err, req, res, next){
    log.fatal(err,thisModule);
    if (err) {
        exports.returnError(err);
    }
};