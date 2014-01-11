/**
 *  View Definition access and update.
 */

var db = require('./database');  // database connection and collection cursors
var config = db.config;
var utilityDao = require(config.dao+'utility');
var log = config.log;
var thisModule = 'dao/viewsDef.js';
log.debug('initializing',thisModule);

// Return detailed view for a given user
exports.getUserView = function(userId,viewId,callback){
    log.debug('getting user view',thisModule);
    // Verify that user has this view
    userId = utilityDao.parseNumericId(userId);
    viewId = utilityDao.parseNumericId(viewId);
    var query = {_id:userId, 'collections.views._id':viewId};
    db.users.findOne(query,function(err,user){
        if (err || user === null) return callback(err,user,null);

        // Read the view definition
        db.views.findOne({_id:viewId},function(err, view) {
            callback(err,user,view);
        });
    });
};

// Return detailed view for a given user
// Adds more Collection details to the View Def from getUserView()
exports.getUserViewDetails = function(userId,viewId,callback){
    log.debug('getting user view details',thisModule);
    exports.getUserView(userId,viewId,function(err,user,view){
        if (err || user == null || view === null)
            return callback(err,user,view);

        // Add detailed collection info to the view
        addCollectionDetails(view, function(view){
            callback(null,user,view);
        });

    })
};

// "join" the view with the collection
// to include field details
var addCollectionDetails = function(view,callback){
   log.debug('join view details with collection info',thisModule);
   db.collections.findOne({_id:view.collection}, function(err, collection) {
        if (err)return callback(err);
        if (collection === null)
            return(Error('internal error, missing collection: ' + collId, 'views.def.internalError'));
        var displayFields = [];
        view['displayFields'] = displayFields;
        view.displayOrder.forEach(function(displayField){
            displayFields.push(findField(collection,displayField));
        });
        callback(view);
    });
};

// return a named displayField
var findField = function(collection,displayField){
    var result = undefined;
    collection.fields.forEach( function(field) {
        if (field.name === displayField) result = field;
    });
    return result;
};

