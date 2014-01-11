/**
    REST get and update View Definitions
 */

var routes = require('./routes.js');
var config = routes.config;
var log = config.log;
var sessions = require('./sessions.js');

var thisModule = 'routes/viewsDef.js';
log.debug('initializing routes',thisModule);

var viewsDefDao = require(config.dao+'viewsDef');

// Return a View Definition
// for a given userId and viewId
exports.getViewDefinition = function(req,res,next){
    log.debug('getViewDefinition',thisModule);
    if (!sessions.requireSession(req,res)) return;

    var userId = req.params.userId;
    var viewId = req.params.viewId;
    viewsDefDao.getUserViewDetails(userId,viewId,
      function(err,user,view){
        if (err) return next(err);
        if (user === null || view === null)
            return config.res.returnNotFound(res,'user not found');

        res.json(view);
    })
};