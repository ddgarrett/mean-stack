/**
        REST Add Feedback
 */

var routes = require('./routes.js');
var config = routes.config;
var log = config.log;
var sessions = require('./sessions.js');

var feedbackDao = require(config.dao+'feedback.js');
var utilityDao = require(config.dao+'utility.js');

var thisModule = 'routes/feedback.js';
log.debug('initializing',thisModule);

// Get a meeting page
exports.addFeedback = function(req,res,next){
    sessions.defaultUserFromSession(req);
    log.debug('add feedback',thisModule);

    // add posting date and session info if present
    var data = req.body;
    data.postDate = new Date();
    data.userId   = req.session.userId

    feedbackDao.addFeedback(data,function(err,editMessage,responseData){
        if (err) return next(err);
        if (editMessage)  return config.res.returnError(res,editMessage);
        res.json(responseData);
    });
};

