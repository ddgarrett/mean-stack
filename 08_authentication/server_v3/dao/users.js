/**
 *  Users access and update.
 */

var db = require('./database');  // database connection and collection cursors
var utilityDao = require('./utility.js');

var config = db.config;
var log = config.log;
var util = config.util;

var hash = require(util+'hash.js');

var thisModule = 'dao/users.js';
log.debug('initializing',thisModule);

var readFields = {fName:1, lName:1, email:1, collections:1, defaultCollection: 1, _id:1} ;
var updateFields = ['fName', 'lName', 'email'];

// Verify user signon password
exports.verifyUserSignon = function(email,password,callback){
    // TODO: allow a user name instead of email?
    log.debug('verify users signon',thisModule);

    // get user
    var query = {email:email};
     db.users.findOne(query,function(err,user){
        if (err || user === null)
            return callback(err,user);

        // hash password using user.salt
        hash.hash(password,user.salt,function(err,hashedPassword){

            // if hashed password doesn't match, return a null user
            if (hashedPassword !== user.hash)
                return callback(null,null);

            // return standard user info
            exports.getUser(user._id,callback);
        })
    });
};

// Get user for a given id
exports.getUser = function(userId,callback){
    log.debug('getting user',thisModule);
    userId = utilityDao.parseNumericId(userId);
    var query = {_id:userId};
    var options = {fields : readFields};
    db.users.findOne(query,options,callback);
};

// update user
exports.updateUserProfile = function(data,callback){
    log.debug('update user profile',thisModule);
    var errorMessage = null;
    var haveUpdatedValue = false;
    var setParams = {};
    for (var i=0; i < updateFields.length; ++i){
        var field = updateFields[i];
        var value = data[field];
        if (value !== undefined){
            if (typeof value === 'string'){
                if (value.trim().length === 0){
                    errorMessage = 'required field missing '
                }
                else {
                    setParams[field] = value;
                    haveUpdatedValue = true;
                }
            }
        }
    }
    if (errorMessage !== null) return (null, errorMessage,0);
    if (!haveUpdatedValue) return (null, 'no data updated', 0);
    var id = utilityDao.parseNumericId(data._id);

    db.users.update({_id: id},{'$set':setParams},
     function(err, count){
        callback(err, null, count);
    })
};


