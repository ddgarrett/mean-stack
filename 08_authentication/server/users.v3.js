var express = require('express');
var mongodb = require('mongodb');
var config = require('./config.json');   // Our configuration (and global variable) file

var hash = require('./hash');  // password module containing hash and salt generator

var collectionName = 'users';

var readFields = {fName:1, lName:1, email:1, defaultCollection:1, collections:1};
var updateFields = ['fName','lName'];

// signon a user
exports.signonUser = function(req,res,next){
    console.log('in signonUser');
    var db = config.mongoDB.db;  // global var set before server started up

    var email = req.body.email;
    var password = req.body.password;
    var searchParms = {'email' : email};

    db.collection(collectionName).findOne(searchParms,function(err,user){
        console.dir('findOne on user: ', err, user );
        if (err) return next(err);  // pass any errors to error module
        if (user === null) return userNotFound(res);

        hash.hash(password,user.salt,function(err,hash){
            if (err) return next(err);
            if (hash !== user.hash) return userNotFound(res);
            req.session.regenerate(function(){
                req.session.userId = user._id;
                req.params.userId = user._id;
                exports.getUser(req,res);
            })
        })
    });
};

// Read a User as defined by :userId
exports.getUser = function(req,res){
    var db = config.mongoDB.db;  // global var set before server started up

    var userId =  verifyUserSession(req,res);
    if (!userId)  return;

    var searchParm = {_id : userId};
    options = {fields : readFields};
    db.collection(collectionName).findOne(searchParm, options, function(err, user) {
      if (err)throw err;
      if (user === null) return userNotFound(res);
      res.json(user);
    })
};

exports.updateUser = function(req,res){
    var db = config.mongoDB.db;

    var userId =  verifyUserSession(req,res);
    if (!userId)  return;

    var updateParm = {};
    updateFields.forEach( function(fieldName) {
        var value = req.body[fieldName];
        if (value == undefined || value.trim().length == 0){
            res.status(400);
            res.json({err:true,
                   errMsg:'required field missing'});
            return
        }
        updateParm[fieldName] = value;
    });

    db.collection(collectionName)
     .update({"_id": userId }, {'$set':updateParm},
      function(err, count) {
        if (err)throw err;
        if (count === 0) return userNotFound(res);

        res.status(200);
        res.json({error: false,
                message: 'updated user '+userId});
    })
};

// Verify that the userId in the params
// is equal to the userId in the session
// If it is, return a parsed userId value
// Else return 0
var verifyUserSession = function(req,res){
    var userId = parseInt(req.params.userId);
    if (req.session.userId  !== userId){
        userNotFound(res);
        return 0
    }
    return userId;
};

var userNotFound = function(res){
    res.status(404);
    res.json({err:1, errMsg:'user not found'});
};

exports.userNotFound = userNotFound;
exports.verifyUserSession = verifyUserSession;














