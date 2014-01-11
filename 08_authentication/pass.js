
// check out https://github.com/visionmedia/node-pwd

/*
(The MIT License)

Copyright (c) 2009-2012 TJ Holowaychuk <tj@vision-media.ca>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the 'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

*/

/**
 * Module dependencies.
 */

var crypto = require('crypto');

/**
 * Bytesize.
 */

var len = 128;

/**
 * Iterations. ~300ms
 */

var iterations = 12000;

/**
 * Hashes a password with optional `salt`, and
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} pwd password to hash
 * @param {String} salt optional salt
 * @param {Function} fn callback
 * @api public
 */

exports.hash = function (pwd, salt, fn) {
    crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
        fn(err, (new Buffer(hash, 'binary')).toString('base64'));
    });
};

exports.getSalt = function(pwd,fn){
    crypto.randomBytes(len, function(err,salt){
        if (err) return fn(err);
        salt = salt.toString('base64');
        crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
            if (err) return fn(err);
            fn(null, salt, (new Buffer(hash, 'binary')).toString('base64'));
        });
    });
};




