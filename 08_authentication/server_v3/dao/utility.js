/**
 *  Users access and update.
 */

var db = require('./database');  // database connection and collection cursors
var config = db.config;
var log = config.log;

var thisModule = 'dao/utility.js';
log.debug('initializing',thisModule);

// make sure a numeric id
// is numeric and > 0
exports.parseNumericId = function(numericId){
    if (typeof numericId !== 'number')
        numericId = parseInt(numericId);

    if (isNaN(numericId))
        numericId = 0;

    if (numericId < 0)
        numericId = 0;

    return numericId;
};

// Create a MongoDB ID object
// try creating the objectId
ObjectID = require('mongodb').ObjectID;   // MongoDB System Generated Object ID
exports.parseObjectId = function(objectId){
    var result;
    try { result = new ObjectID(objectId); }
    catch (err){
        result = new ObjectID();
    }
    return result;
};


// Copy fields from input to updateParms,
// Non-blank fields are put in the "$set" param.
// Blank fields are put in the "$unset" param.
// Fields which are not allowed to be modified are ignored.
exports.buildUpdateParms = function(updateParams, input, view){
    log.debug('in buildUpdateParms',thisModule);
    // log.inspect(input,thisModule+':input');

    var haveSetParams = false;
    var haveUnsetParams = false;
    var set = {};
    var unset = {};

    view.displayFields.forEach(function(fieldDef){
        var value = input[fieldDef.name];
        if (value !== undefined && fieldDef.editable){
            if (typeof value === 'string'){
                value = value.trim();
            }

            if (value ===  null || value.length === 0){
                haveUnsetParams = true;
                unset[fieldDef.name] = value;
            }
            else {
                haveSetParams = true;
                set[fieldDef.name] = parseField(value,fieldDef);
            }
        }
    });

    if (haveSetParams) updateParams['$set'] = set;
    if (haveUnsetParams) updateParams['$unset'] = unset;

    // log.inspect(updateParams,thisModule+':output');
};


/************************************************************
 Various parsing functions
 Slightly different than client side.
 - we do store 0 for numbers and return 0 for invalid numbers
 - we assume that we're not passed "undefined"
   (caller handles those)
 - we assume caller already trimmed strings
 *************************************************************/
var parse = {};  // HashMap of parsing functions

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

