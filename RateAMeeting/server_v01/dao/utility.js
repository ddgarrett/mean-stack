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
exports.parseInteger = function(numericId){
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
var ObjectID = require('mongodb').ObjectID;   // MongoDB System Generated Object ID
exports.parseObjectId = function(objectId){
    var result;
    try { result = new ObjectID(objectId); }
    catch (err){
        result = new ObjectID();
    }
    return result;
};


// Generate a meeting number,
//   a six digit number unique within a 60 day time window
// Recursive call until an okay number is found.
// If an initial _id is specified,
//   test the voteId for that meeting first
exports.getMeetingNumber = function(date,maxTries,_id,callback){
    // Build query with a date range
    var dayOfMonth = date.getDate();
    var time = date.getTime();

    var minDate = new Date(time);
    minDate.setDate(dayOfMonth - 30);

    var maxDate = new Date(time);
    maxDate.setDate(dayOfMonth + 30);

    var dateQuery = {date: {'$gt':minDate, '$lt':maxDate}};

    // if an _id is specified, get the current meeting number from that
    if (_id){
        // find voteId for the meeting
        var query = {_id: _id};
        var options = {fields : {voteId: 1}};
        db.meetings.findOne(query,options,function(err,data){
            if (err) return callback(err);

            // set the voteId
            dateQuery.voteId = data.voteId

            // exclude the current _id from the test
            dateQuery._id = {'$ne':_id};

            // test the voteId
            testMeetingNumber(dateQuery,callback,generateMeetingNumber,maxTries);
        });
    }
    else {
        // generate a new voteId
        generateMeetingNumber(dateQuery,callback,maxTries);
    }
};

// Generate a new meeting number, aka voteId, then call testMeetingNumber
var generateMeetingNumber = function(dateQuery, callback, maxTries){
    if (--maxTries < 0){
        callback (new Error('unable to find unique number'));
    }
    else {
        dateQuery.voteId = Math.floor((Math.random() * 1000000));
        testMeetingNumber(dateQuery,callback,generateMeetingNumber,maxTries);
    }
};

// Test the number
var testMeetingNumber = function(dateQuery, okayCallback, tryAgainCallback, maxTries){
    log.debug('testing meeting number '+dateQuery.voteId+', remainingTries: '+maxTries,thisModule)
    db.meetings.find(dateQuery).count(function(err,count){
        if (err || count === 0)
            okayCallback(err,dateQuery.voteId);
        else
            tryAgainCallback(dateQuery,okayCallback,maxTries);
    });
};


// Build a new document from input based on
// Display Fields array
exports.buildDocument = function(newDocument, input, displayFields){
    var error = null;
    displayFields.forEach(function(field){
        var value = input[field.name];
        if (field.editable && value != undefined){
            if (typeof value === 'string') value = value.trim();
            value = parseField(value,field);
            if (value !== null){
                newDocument[field.name] = value;
            }
        }
        if (field.required
            &&  (newDocument[field.name] === undefined ||
                 newDocument[field.name] === null))
            error = 'field missing: ' + field.header;
    });

    return error;
};


// Copy fields from input to updateParms,
// Non-blank fields are put in the "$set" param.
// Blank fields are put in the "$unset" param.
// Fields which are not allowed to be modified are ignored.
exports.buildUpdateParams = function(input, fields){
    log.debug('in buildUpdateParms',thisModule);

    var result = {};
    result.errors = [];
    result.updateParams = {};
    result.dataUpdated = false;

    var haveSetParams = false;
    var haveUnsetParams = false;
    var set = {};
    var unset = {};

    fields.forEach(function(field){
        var value = input[field.name];

        if (value !== undefined && field.editable){
            value = parseField(value,field);
            if (typeof value === 'string') value = value.trim();

            if (value ===  null ){
                if (field.required){
                    result.errors.push('required field missing: ' + field.name)
                }
                else {
                    haveUnsetParams = true;
                    unset[field.name] = value;
}               }
            else {
                haveSetParams = true;
                set[field.name] = parseField(value,field);
            }
        }
    });

    if (haveSetParams) result.updateParams['$set'] = set;
    if (haveUnsetParams) result.updateParams['$unset'] = unset;

    result.dataUpdated = (haveSetParams || haveUnsetParams);
    return result;
};


/************************************************************
 Various formatting functions
 Only need a formatter if the field is different
 in the download.
 *************************************************************/

var format = {};

format.date = function(row,field){
    var value = row[field.name];
    row[field.name] = '';

    if (value === undefined) return;
    if (typeof value === 'string' && value.trim().length === 0) return;

    var d = new Date(value);
    var currDate  = padNumber((d.getDate()),2);
    var currMonth = padNumber((d.getMonth()+1),2);
    var currYear  = padNumber(d.getFullYear(),4);
    row[field.name] =  currMonth + "/" + currDate + '/' + currYear;
};

format.meetingNumber = function(row,field){
    var value = row['voteId'];
    row[field.name] = '';
    if (!value) return;
    var voteId = padNumber(value,6);
    row[field.name] = voteId.substring(0,3) + '-' + voteId.substring(3)
};

format.voteLink = function(row,field){
    var value =  row['voteId'];
    row[field.name] = '';
    if (!value) return;
    row[field.name] = '#/vote/' + value;
};

format.calcVotes = function(row,field){
    row[field.name] = '0';
    var voteList = row['voteList'];
    if (!voteList || voteList.length === 0) return;
    row[field.name] = '' + voteList.length;
};

format.calcRating = function(row,field){
    row[field.name] = '';
    var voteList = row['voteList'];
    if (!voteList || voteList.length === 0) return;
    var total = 0;
    var count = voteList.length;
    voteList.forEach(function(vote){
        if (vote.value) total += vote.value;
    });

    var calc = (total/count);
    row[field.name] = '' + calc.toFixed(1);
};

var padNumber = function (number, width) {
    var result = '' + number;
    while (result.length < width) {
        result = '0' + result;
    }
    return result;
};

exports.formatDisplay = function(row,fields){
    fields.forEach(function(field){
        var formatter = format[field.type];
        if (formatter)
            formatter(row,field)
    });
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
   var value = value.toString().trim();
    if (value.length == 0) return null;
    return value;
};

parse.email = parse.string;
parse.text  = parse.string;
parse.textArea = parse.string;
parse.password = parse.string;

parse.select = function(value,def){
    value = value.toString();
    for (var i=0; i < def.options.length; ++i){
        if (def.options[i] === value)
            return value;
    }
    return null;
};

parse.money = function(value){
    if (typeof value === 'number'){
        return testZero(value);
    }
    value = parseInt(input);
    if (isNaN(value)){
        return null;
    }
    return testZero(value);
};

// if value is zero but is required, return null
var testZero = function(value){
  if (value === 0) return null;
  return value;
};

parse.date = function(value){
    if (typeof value === 'date') return value;
    if (typeof value === 'string'){
        if (value.trim().length === 0) return null;
    }
    return new Date(value);
};

parse.boolean = function(value){
    if (typeof value === 'boolean') return value;
    var input = value;
    if (typeof input === 'string' ){
        input = input.toLowerCase().trim();
        if (input.length === 0) return null;
    }
    if (typeof input === 'number') return (input !== 0);
    return ['true', 't', 'yes', 'y', '1'].indexOf(input) >= 0;
};

parse.id = function(value){
    return exports.parseObjectId(value);
};

parseField = function(value,def){
    return parse[def.type](value,def);
};


