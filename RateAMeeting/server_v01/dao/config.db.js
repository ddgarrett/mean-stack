/**********************************************
 MongoDB related configuration

 May need to configure
 based on DB configuration.
 ***********************************************/

var MongoClient = require('mongodb').MongoClient    // MongoDB Client

// get mongodb connection
var mongoDbConnectionString = "mongodb://localhost:27017/rateameeting";
var mongoDbOptions = {};

// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
    mongoDbConnectionString = 'mongodb://' +
        process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
}

console.log('connection string: '+ mongoDbConnectionString);

exports.getDatabase = function(callback){
    MongoClient.connect(mongoDbConnectionString, mongoDbOptions, callback);
};