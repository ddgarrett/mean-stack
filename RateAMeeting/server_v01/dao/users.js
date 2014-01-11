/**
 *  Users access and update.
 */

var db = require('./database');  // database connection and collection cursors
var utilityDao = require('./utility.js');

var config = db.config;
var log = config.log;
var util = config.utility;

var hash = require(util+'hash.js');

var thisModule = 'dao/users.js';
log.debug('initializing',thisModule);

var readFields = {fName:1, lName:1, email:1 } ;

var userUpdateFields = [
    {header: 'First Name',      name: 'fName', type: 'text',  editable: true, required: true},
    {header: 'Last Name',       name: 'lName', type: 'text',  editable: true, required: true},
    {header: 'New Email',       name: 'email',    type: 'email',    editable: true, required: true},
    {header: 'New Password',    name: 'password', type: 'password', editable: true, required: true}
];

// Add a new user
exports.addUser = function(data,callback){
    log.debug('add user',thisModule);

    // TODO: edit new user fields before adding

    data.email = data.email.toLowerCase();

    // Make sure email not already used
    var query = {email:data.email};
    db.users.findOne(query,function(err,user){
        if (user){
            return callback(null,'user already exists',null);
        }

        data.password = hash.generatePassword(data.password);
        db.users.insert(data,function(err){
            callback(err,null,data);
        });

    });

};

// Verify user signon password
exports.verifyUserSignon = function(email,password,callback){
    log.debug('verify users signon',thisModule);

    // get user
    var query = {email:email};
     db.users.findOne(query,function(err,user){
        if (err || user === null){
            return callback(err,user);
        }

        if (!hash.comparePassword(password,user.password)){
            return callback(null,null);
        }

        exports.getUser(user._id.toString(),callback);
    });
};

// Get user for a given id
exports.getUser = function(userId,callback){
    log.debug('getting user',thisModule);
    userId = utilityDao.parseObjectId(userId);
    var query = {_id:userId};
    var options = {fields : readFields};
    db.users.findOne(query,options,callback);
};

// update user
exports.updateUserProfile = function(data,callback){
    log.debug('update user profile',thisModule);

    // if password changed, hash it
    if (data.password){
        data.password = hash.generatePassword(data.password);
    }

    // if email changed, verify that it is not already used
    if (data.email){
        var objectId = utilityDao.parseObjectId(data._id);
        var query = {email:data.email, _id :{'$ne': objectId}};
        db.users.findOne(query,function(err,user){
            if (err) return callback(err);
            if (user) return callback(null,'email address already used');
            completeUserUpdate(data,callback);
        });
    }
    else {
        completeUserUpdate(data,callback);
    }
};

var completeUserUpdate = function(data,callback){
    var result = utilityDao.buildUpdateParams(data,userUpdateFields);

    if (result.errors.length > 0) return callback(null, result.errors[0],0);
    if (!result.dataUpdated) return callback(null, 'no data updated', 0);
    var id = utilityDao.parseObjectId(data._id);

    db.users.update({_id: id},result.updateParams, function(err, count){
        callback(err, null, count);
    })
};

