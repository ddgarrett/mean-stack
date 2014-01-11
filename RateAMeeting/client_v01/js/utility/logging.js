
/*
 Level	Description
 FATAL	Severe errors that cause premature termination. Expect these to be immediately visible on a status console.
 ERROR	Other runtime errors or unexpected conditions. Expect these to be immediately visible on a status console.
 WARN
 INFO	Interesting runtime events (startup/shutdown). Expect these to be immediately visible on a console, so be conservative and keep to a minimum.
 DEBUG	detailed information on the flow through the system. Expect these to be written to logs only.
 TRACE	more detailed information. Expect these to be written to logs only.

 */

RamModule.factory('logging', function() {
    var logging = {};

    console.log('initializing logging service');

    logging.logWarn = true;
    logging.logInfo = true;
    logging.logDebug = true;
    logging.logTrace = true;
    logging.logInspect = true;

    logging.fatal = function (msg,thisModule){
        console.error('***** FATAL: '+getMessage(msg,thisModule));
    };
    
    logging.error = function (msg,thisModule){
        console.error('----- ERROR: '+getMessage(msg,thisModule));
    };
    
    logging.warn = function (msg,thisModule){
        if (logging.logWarn)
            console.warn('WARN: '+getMessage(msg,thisModule));
    };
    
    logging.info = function (msg,thisModule){
        if (logging.logInfo)
            console.log('info: '+getMessage(msg,thisModule));
    };
    
    logging.debug = function (msg,thisModule){
        if (logging.logDebug)
            console.log('debug: '+getMessage(msg,thisModule));
    };
    
    logging.trace = function (msg,thisModule){
        if (logging.logTrace)
            console.log('trace: '+getMessage(msg,thisModule));
    };
    
    logging.inspect = function(object, thisModule){
        if (logging.logInspect){
            console.log('inspect: '+ getMessage('',thisModule));
            console.dir(object);
        }
    };

    var getMessage = function(msg,thisModule){
        if (thisModule) return '('+thisModule+') '+ msg;
        return msg;
    };

    return logging;
});