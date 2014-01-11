/*
    Hash passwords
    Compare a password to a hash
    Generate a secure ID
 */

var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

exports.comparePassword = function(pswd1, pswd2){
    return bcrypt.compareSync(pswd1, pswd2);
};

exports.generatePassword = function(password){
    // Generate password hash
    var salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
};

exports.generateSecureId = function(){
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return  crypto.createHash('sha1').update(current_date + random).digest('hex');
};




