/*
    Hash a password using a given salt.
    Also generates a salt to be used in the hash.
 */

var crypto = require('crypto');

var keyLength = 256;
var saltLength = 128;
var iterations = 10000;

exports.hash = function (password, salt, callback) {
    crypto.pbkdf2(password, salt, iterations, keyLength, function(err, hash){
        callback(err, (new Buffer(hash, 'binary')).toString('base64'));
    });
};

exports.getSalt = function(password,callback){
    crypto.randomBytes(saltLength, function(err,salt){
        if (err) return callback(err);
        salt = salt.toString('base64');
        exports.hash(password,salt,function(err,hash){
            callback(err, salt, hash);
        });
    });
};




