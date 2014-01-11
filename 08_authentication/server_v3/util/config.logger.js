
/*
 Level	Description
 FATAL	Severe errors that cause premature termination. Expect these to be immediately visible on a status console.
 ERROR	Other runtime errors or unexpected conditions. Expect these to be immediately visible on a status console.
 WARN
 INFO	Interesting runtime events (startup/shutdown). Expect these to be immediately visible on a console, so be conservative and keep to a minimum.
 DEBUG	detailed information on the flow through the system. Expect these to be written to logs only.
 TRACE	more detailed information. Expect these to be written to logs only.

*/

var util = require('util');  // output utility

exports.fatal = function (msg,thisModule){
    util.error('***** FATAL: '+getMessage(msg,thisModule));
};

exports.error = function (msg,thisModule){
    util.error('----- ERROR: '+getMessage(msg,thisModule));
};

exports.warn = function (msg,thisModule){
    util.error('WARN: '+getMessage(msg,thisModule));
};

exports.info = function (msg,thisModule){
    util.log('info: '+getMessage(msg,thisModule));
};

exports.debug = function (msg,thisModule){
    util.debug(getMessage(msg,thisModule));
};

exports.trace = function (msg,thisModule){
    util.log('trace: '+getMessage(msg,thisModule));
};

exports.inspect = function(object, thisModule){
    util.log('inspect: ' + getMessage(' ',thisModule)
        +util.inspect(object,{ colors: true, showHidden: true, depth: null }))
};

var getMessage = function(msg,thisModule){
    if (thisModule) return '('+thisModule+') '+ msg;
    return msg;
};