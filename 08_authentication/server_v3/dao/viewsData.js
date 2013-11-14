/**
 *  View Data access and update.
 */

var db = require('./database');  // database connection and collection cursors
var config = db.config;
var log = config.log;
var viewDefDao = require('./viewsDef');
var utilityDao = require('./utility');

var thisModule = 'dao/viewsData.js';
log.debug('initializing',thisModule);

exports.getPage = function(userId,viewId,skip,limit,callback){
    log.debug('get page',thisModule);
    viewDefDao.getUserView(userId,viewId,function(err,user,view){
        if (err || user === null || view === null)
            return callback(err,null);

        var params = {};
        if (skip) params['skip'] = utilityDao.parseNumericId(skip);
        if (limit) params['limit'] = utilityDao.parseNumericId(limit);

        params['fields'] =  view.fields;  // set list of columns to display
        db[view.collection].find({},params).sort({_id:1}).toArray( function(err, data) {
            callback(err,data);
        })
    })
};

exports.getViewDataCount = function(userId,viewId,callback){
    log.debug('getting count',thisModule);
    viewDefDao.getUserView(userId,viewId,function(err,user,view){
        if (err || user === null || view === null)
            return callback(err,0);

        db[view.collection].find().count( function(err,count){
            callback(err,count);
        });
    })
};

exports.getViewDataItem = function(userId,viewId,dataId,callback){
    log.debug('getting data item '+dataId,thisModule);
    viewDefDao.getUserView(userId,viewId,function(err,user,view){
        if (err || user === null || view === null)
            return callback(err,null);

        var query = {_id: utilityDao.parseObjectId(dataId)};
        var params = {fields : view.fields};  // set list of columns to display
        db[view.collection].findOne(query,params, function(err, data) {
            callback(err,data);
        });
    });
};

exports.updateViewDataItem = function(userId,viewId,dataId,data,callback){
    log.debug('update data item '+dataId,thisModule);
    viewDefDao.getUserViewDetails(userId,viewId,function(err,user,viewDetails){
        if (err || user === null || viewDetails === null)
            return callback(err,'user not found',0);

        var _id = utilityDao.parseObjectId(dataId);
        var updateParams = {};
        var errorMessage = utilityDao.buildUpdateParms(updateParams,data,viewDetails);
        if (errorMessage) return callback(null,errorMessage,0);

        log.inspect(data,thisModule);
        log.inspect(updateParams, thisModule);

        db[viewDetails.collection].update({_id: _id},updateParams, function(err, count) {
            callback(err,null,count);
        });
    });

}

