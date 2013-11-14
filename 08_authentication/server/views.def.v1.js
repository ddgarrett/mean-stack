var express = require('express');
var mongodb = require('mongodb');
var config = require('./config.json');   // Our configuration (and global variable) file
var users = require('./users.v3');       // Our users functions

// TODO: need to add security to this 
// to ensure that caller is authorized to access this view and details


// Find the definition of a View
// as defined by a :userId and :viewId
exports.getViewDefinition = function(req,res){  
    var db = config.mongoDB.db;

    // verify that the user is in a valid session
    var userId = users.verifyUserSession(req,res);
    if (!userId) return;

    var viewId = parseInt(req.params.viewId);
    getUserView(userId, viewId, function(user){
        if (user === null){
           res.status(404);
           res.json({err:1, errMsg:'view not found'});
           return
        }

        // read the view definition
        db.collection('views').findOne({_id:viewId},function(err, view) {
        if (err)throw err;
        if (view === null) throw new Error('internal error, missing view: ' + viewId);
        addCollectionDetails(view, function(view){
          res.json(view);
        });
        });
    });
};
 
 
// Internal function to get the user for a given user and view.
// Validates that the user exists and that the viewID is valid.
// Calls the callback with the (user)
function getUserView(userId, viewId, callback){
    var db = config.mongoDB.db;

    // verify that the User has this View
    var filter = {_id:userId, 'collections.views._id':viewId};
    db.collection('users').findOne(filter, function(err, user) {
      if (err)throw err;
      callback(user);
    });
}

// "join" the view with the collection
// to include field details
var addCollectionDetails = function(view,callback){
    var db = config.mongoDB.db;
    db.collection('collections').findOne({_id:view.collection}, function(err, collection) {
        if (err)throw err;
        if (collection === null)
            throw new Error('internal error, missing collection: ' + collId, 'views.def.internalError');
        var displayFields = new Array();
        view['displayFields'] = displayFields;
        view.displayOrder.forEach(function(displayField){
            displayFields.push(findField(collection,displayField));
        });
        callback(view);
    });

};

exports.addCollectionDetails = addCollectionDetails;

// return a named displayField
function findField(collection,displayField){
  var result
  collection.fields.forEach( function(field) {
    if (field.name === displayField) result = field;
  });
  return result;
}
