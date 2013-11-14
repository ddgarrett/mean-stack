var express = require('express');
var mongodb = require('mongodb');
var config = require('./config.json');   // Our configuration (and global variable) file

var collectionName = 'users';

// TODO: need to add security to this 
// to ensure that caller is authorized to read this user

// Read a User as defined by :userId
exports.getUserByEmail = function(req,res){
    var db = config.mongoDB.db;  // global var set before server started up

    // Allow search by ID or email address
    var searchKey = '_id';
    var searchValue = parseInt(req.params.email);
    if (req.params.email.indexOf('@') > 0){
        searchKey = 'email';
        searchValue = req.params.email;
    }

    var searchParm = {};
    searchParm[searchKey] = searchValue;

    db.collection(collectionName).findOne(searchParm, function(err, user) {
      if (err)throw err;
      if (user === null){
       res.status(404);
       res.json({err:1, errMsg:'user not found'});
       return
    }

    res.json(user);
    })
};

exports.updateUser = function(req,res){
    var db = config.mongoDB.db;

    var userId = parseInt(req.params.userId);
    var updateParm = {};
    ['lName','fName'].forEach( function(fieldName) {
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
        if (count === 0){
            res.status(400);
            res.json({err: true,
                   errMsg:'user not found: '+userId});
        }
        else {
            res.status(200);
            res.json({error: false,
                    message: 'updated user '+userId});
        }
    })
};














