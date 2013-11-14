var express = require('express');
var mongodb = require('mongodb');
var config = require('./config.json');   // Our configuration (and global variable) file
ObjectID = require('mongodb').ObjectID;   // MongoDB System Generated Object ID

var viewsDef = require('./views.def.v1');    // Our View Definition
var users = require('./users.v3');       // Our users functions

// TODO: need to add security to this
// to ensure that caller is authorized to access this view and details


// View a page as defined by a :userId, :viewId
// Additional query string parms: skip=nn, limit=nn
exports.getViewDataPage = function(req,res){
  // verify that the user is in a valid session
  var userId = users.verifyUserSession(req,res);
  if (!userId) return;

  var parms = {};
  if (req.query.skip) parms['skip'] = req.query.skip;
  if (req.query.limit) parms['limit'] = req.query.limit;

  getUserViewCollection(userId, parseInt(req.params.viewId),
  function(user, view, collection){
    if (collection === null){
       res.status(404);
       res.json({err:1, errMsg:'collection not found'});
       return
    }
    
    parms['fields'] =  view.fields;  // set list of columns to display
    collection.find({},parms).sort({_id:1}).toArray( function(err, data) {
      if (err)throw err;
      res.json(data);
    })
  });  
};

// Return a count of the number of items in a View
exports.getViewDataCount = function(req,res){    
  var parms = {};

  // verify that the user is in a valid session
  var userId = users.verifyUserSession(req,res);
  if (!userId) return;

  getUserViewCollection(userId, parseInt(req.params.viewId),
  function(user, view, collection){
    if (collection === null){
       res.status(404);
       res.json({err:1, errMsg:'collection not found'});
       return
    }
    
    parms['fields'] =  view.fields;  // set list of columns to display
    collection.count( function(err, count) {
      if (err)throw err;
      res.json({count : count});
    })
  });  
};

// View a single object from a collection
// as defined by a :userId, :viewId and :objectId
exports.getViewDataItem = function(req,res){
  // verify that the user is in a valid session
  var userId = users.verifyUserSession(req,res);
  if (!userId) return;


    // try creating the objectId
  var objectId;
  try { objectId = new ObjectID(req.params.dataId); }
  catch (err){
      res.status(404);
      res.json({err:1, errMsg:'item not found'});
      return
  }

  getUserViewCollection(parseInt(req.params.userId), parseInt(req.params.viewId), 
  function(user, view, collection){
    if (collection === null){
       res.status(404);
       res.json({err:1, errMsg:'item not found'});
       return
    }

    collection.findOne({_id:objectId},{fields:view.fields},function(err, data) {
      if (err)throw err;
      res.json(data);
    })
  });  
};

// Update a single item
exports.updateViewDataItem = function(req,res){
    // verify that the user is in a valid session
    var userId = users.verifyUserSession(req,res);
    if (!userId) return;

    // try creating the objectId
    var dataId = req.params.dataId;
    var objectId;
    try { objectId = new ObjectID(dataId); }
    catch (err) { return buildErrorResp(res,'item not found'); }

    //Verify access to view by user, and get the view definition
    getUserViewCollection(parseInt(req.params.userId), parseInt(req.params.viewId),
    function(user, view, collection){
        if (collection === null) return buildErrorResp(res,'item not found');

        var updateParms = {};
        // NOTE: we have to add details of the fields in the view
        // by reading the collection definition
        viewsDef.addCollectionDetails(view, function(detailedView){
            var errMsg = buildUpdateParms(updateParms,req.body,detailedView);
            if (errMsg) return buildErrorResp(res, error);

            collection.update({"_id": objectId }, updateParms,
                function(err, count) {
                    if (err)throw err;
                    if (count === 0) return buildErrorResp(res,'item not found');
                    else {
                        res.status(200);
                        res.json({error: false,message: 'updated item '+dataId});
                    }
                });
        });
    });
};


function buildErrorResp(res,errMsg){
    res.status(400);
    res.json({err: true, errMsg: errMsg});
}

// Internal function to get the collection for a given user and view.
// Calls the callback with the (user, view, collection)
function getUserViewCollection(userId, viewId, callback){
    var db = config.mongoDB.db;

    // verify that the User has this View
    var filter = {_id:userId, 'collections.views._id':viewId};
    db.collection('users').findOne(filter, function(err, user) {
        if (err)throw err;
        if (user === null){
            // user does not have the view
            callback(null,null,null);
            return;
        }

        // read the view definition
        // should find the view or internal error
        db.collection('views').findOne({_id:viewId}, function(err, view){
            if (err) throw err;
            if (view === null) throw new Error('internal error, missing view: ' + viewId);

            // finally - get the collection referenced by the view
            db.collection(view.collection, function(err,collection){
                if (err) throw err;
                callback(user,view,collection);
            });
        });
    });

}

// Copy fields from input to updateParms,
// Non-blank fields are put in the "$set" parm.
// Blank fields are put in the "$unset" parm.
// Fields which are not allowed to be updated may not be passed,
// even if they have not been modified
// (we don't read current data- but we could just ignore those?)
function buildUpdateParms(updateParms, input, view){
    var haveSetParms = false;
    var haveUnsetParms = false;
    var set = {};
    var unset = {};

    view.displayFields.forEach(function(fieldDef){
        var value = input[fieldDef.name];
        if (value !== undefined){

            if (!fieldDef.editable)
                return "modifying field not allowed: " + fieldDef.name;

            if (typeof value === 'string'){
                value = value.trim();
            }
            if (value ===  null || value.length === 0){
                console.log('unsert '+fieldDef.name);
                haveUnsetParms = true;
                unset[fieldDef.name] = value;
            }
            else {
                console.log('set '+fieldDef.name);
                haveSetParms = true;
                set[fieldDef.name] = parseField(value,fieldDef);
                console.log('    value: '+value +' ('+(typeof value)+'), parsedValue: '+  set[fieldDef.name]+' ('+(typeof set[fieldDef.name])+')');
            }
        }
    });

    if (haveSetParms) updateParms['$set'] = set;
    if (haveUnsetParms) updateParms['$unset'] = unset;
}


/************************************************************
    Various parsing functions
    Slightly different than client side.
    - we do store 0 for numbers and return 0 for invalid numbers
    - we assume that we're not passed "undefined"
      (caller handles those)
    - we assume caller already trimmed strings and empty strings

*************************************************************/

    var parse = {};

    parse.string = function(value){
        return value;
    };

    parse.money = function(value){
        if (typeof value === 'number'){
            return value;
        }
        value = parseInt(input);
        if (isNaN(value)){
            return 0;
        }
        return value;
    };

    parse.date = function(value){
        if (typeof value === 'date') return value;
        return new Date(value);
    };

    parse.boolean = function(value){
        if (typeof value === 'boolean') return value;

        var input = value;
        if (typeof input === 'string' ) input = input.toLowerCase().trim();
        if (typeof input === 'number' && input > 0) return true;
        return [true,'true', 't', 'yes', 'y', '1'].indexOf(input) >= 0;
    };

    parse.id = function(value){
        return value;
    };

    parseField = function(value,def){
        return parse[def.type](value);
    };

