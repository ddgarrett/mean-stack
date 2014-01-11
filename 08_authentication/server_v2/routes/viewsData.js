/**
    REST get and update View Data
 */

var routes = require('./routes.js');
var config = routes.config;
var log = config.log;
var viewsDataDao = require(config.dao+'viewsData');

var thisModule = 'routes/viewData.js';
log.debug('initializing',thisModule);

// Return a "page" of Data via a View
// Page is defined by URI parameters Skip and Limit
exports.getViewDataPage = function(req,res){
    var userId = req.params.userId;
    var viewId = req.params.viewId;
    var skip = req.query.skip;
    var limit = req.query.limit;

    log.debug('getting view data page',thisModule);

    viewsDataDao.getPage(userId,viewId,skip,limit,function(err,data){
        if (err) return next(err);
        if (data === null)
            return config.res.returnNotFound(res,'user not found');

        res.json(data);
    })

}

// Return count of rows of a given View
exports.getViewDataCount = function(req,res){
    log.debug('getting view count',thisModule);
    var userId = req.params.userId;
    var viewId = req.params.viewId;

    viewsDataDao.getViewDataCount(userId,viewId,function(err,count){
        if (err) return next(err);
        if (count === null)
            return config.res.returnNotFound(res,'user not found');

        log.debug('view data count: '+count,thisModule);
        res.json({count:count});
    })
};

// Return a single item from a View
exports.getViewDataItem = function(req,res,next){
    log.debug('getting view data item',thisModule);
    var userId = req.params.userId;
    var viewId = req.params.viewId;
    var dataId = req.params.dataId;

    viewsDataDao.getViewDataItem(userId,viewId,dataId,function(err,data){
        if (err) return next(err);
        if (data === null)
            return config.res.returnNotFound(res,'user not found');

        res.json(data);
    })
};

// Update a single item from a View
exports.updateViewDataItem = function(req,res){
    log.debug('update one item for view',thisModule);
    var userId = req.params.userId;
    var viewId = req.params.viewId;
    var dataId = req.params.dataId;
    var data   = req.body;

    viewsDataDao.updateViewDataItem(userId,viewId,dataId,data,
        function(err,editMessage,updateCount){
        if (err)
            return next(err);
        if (editMessage)
            return config.res.returnError(res,editMessage);
        if (updateCount === 0)
            return config.res.returnNotFound(res,'itme not found');

        config.res.returnOkayMessage(res,'item updated');
    });
};

