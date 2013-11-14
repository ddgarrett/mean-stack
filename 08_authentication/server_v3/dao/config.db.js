/**********************************************
 MongoDB related configuration

 May need to configure
 based on DB configuration.
 ***********************************************/

var MongoClient = require('mongodb').MongoClient    // MongoDB Client

// get mongodb connection
var mongoDbConnectionString = "mongodb://localhost:27017/tmt";
var mongoDbOptions = {};

exports.getDatabase = function(callback){
    MongoClient.connect(mongoDbConnectionString, mongoDbOptions, callback);
};
