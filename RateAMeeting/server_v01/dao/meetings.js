/**
 *  Meetings access and update.
 */

var db = require('./database');  // database connection and collection cursors
var utilityDao = require('./utility.js');

var config = db.config;
var log = config.log;
var util = config.utility;

var hash = require(util+'hash.js');
var ObjectID = require('mongodb').ObjectID;   // MongoDB System Generated Object ID

var thisModule = 'dao/meetings.js';
log.debug('initializing',thisModule);

var readFields = {date:1, description:1, voteList:1, voteId: 1} ;

var updateFields = [
    {header: 'Date (required)', name: 'date', type: 'date', editable: true, listClass:'txt-center', headerClass:'txt-center', required: true},
    {header: 'Description (required)', name: 'description', type: 'text', editable: true, listClass:'txt-left', headerClass:'txt-left', required: true}
];

// Get meeting for a given user and meeting id
exports.getMeeting = function(userId,meetingId, callback){
    log.debug('getting meeting',thisModule);
    userId = utilityDao.parseObjectId(userId);
    meetingId = utilityDao.parseObjectId(meetingId);
    var query = {_id: meetingId, userId: userId};
    var options = {fields : readFields};
    db.meetings.findOne(query,options,callback);
};

// Add a new meeting
exports.addMeeting = function(userId,data,callback){
    log.debug('add meeting',thisModule);

    // default fields for a new document
    var newDocument = {
        createDate: new Date(),
        userId: utilityDao.parseObjectId(userId),
        voteList: []
    };

    var errorMessage = utilityDao.buildDocument(newDocument,data,updateFields);
    if (errorMessage) return callback(null,errorMessage,null);

    // Generate the semi-unique meeting number - voteId
    utilityDao.getMeetingNumber(newDocument.date, 10, undefined, function(err,voteId){
        if (err) return callback(null,err,null);
        newDocument.voteId = voteId;

        // insert the meeting
        db.meetings.insert(newDocument,function(err){
            callback(err,null,data);
        });
    })
};

exports.updateMeeting = function(userId,meetingId,data,callback){
    // todo: if date changes, verify that the code is still unique within a 60 day window

    var result = utilityDao.buildUpdateParams(data,updateFields);

    if (result.errors.length > 0) return callback(null, result.errors[0],0);
    if (!result.dataUpdated) return callback(null, 'no data updated', 0);

    var query = {
        _id: utilityDao.parseObjectId(meetingId),
        userId: utilityDao.parseObjectId(userId)
    };

    var date = result.updateParams['$set'].date;

    // if date changes, set the the voteId to either the existing or a new number
    if (date){
        utilityDao.getMeetingNumber(date, 10, query._id, function(err,voteId){
            if (err) return callback(null,err,null);

            result.updateParams['$set'].voteId = voteId;

            // update the meeting
            db.meetings.update(query,result.updateParams, function(err, count){
                callback(err, null, count);
            })
        })
    }
    else {
        db.meetings.update(query,result.updateParams, function(err, count){
            callback(err, null, count);
        })
    }
};

// Read a list of meetings
exports.getMeetingPage = function(userId,meetingType,callback){
    log.debug('get meeting page type '+meetingType,thisModule);

    var query = {userId: utilityDao.parseObjectId(userId)};
    var options = {limit: 30, sort: ['date','_id']};

    // past = more than two days in past
    var pastDate = new Date();
    pastDate.setDate(pastDate.getDate()-2);

    // future = more than one day in future
    var futureDate = new Date();
    futureDate.setDate(futureDate.getDate()+1);

    if (meetingType === 'future'){
        options.limit = 60;
        query.date = {'$gte':futureDate};
    }
    else if (meetingType === 'past'){
        options.sort = [['date','desc'],['_id','desc']];
        query.date = {'$lte':pastDate};
    }
    else {
        query['$and'] = [{date: {'$gte':pastDate}},{date: {'$lte': futureDate}}]
    }

    db.meetings.find(query,readFields,options).toArray( function(err, data) {
        callback(err,data);
    });
};

exports.removeMeeting = function(userId,meetingId,callback){
    log.debug('remove meeting',thisModule);

    var query = {
        _id: utilityDao.parseObjectId(meetingId),
        userId: utilityDao.parseObjectId(userId)
    };

    db.meetings.remove(query,{w:1},callback);
};

// Download all meetings, ordered by Date
exports.getDownload = function(userId,callback){
    log.debug('getting user downloads',thisModule);
    var query = {userId:  utilityDao.parseObjectId(userId)};
    var options = {sort: ['date','_id'], limit: 60};
    db.meetings.find(query,readFields,options).toArray( function(err, data) {
        callback(err,data);
    });
};

// Get meeting vote item id
exports.getMeetingByVoteId = function(voteId, callback){
    log.debug('getting meeting for voteId '+voteId,thisModule);

    var query = {voteId: utilityDao.parseInteger(voteId)};
    var options = {fields : {date: 1, description: 1, voteId: 1}};

    // make sure meeting date is within a certain range
    buildDateQuery(new Date(),query);

    db.meetings.findOne(query,options,callback);
};

// Add a vote to a meeting
exports.addMeetingVote = function(voteId,vote,callback){
    log.debug('add vote to meeting',thisModule);

    var query = {voteId:  utilityDao.parseInteger(voteId)};

    // make sure meeting date is within a certain range
    buildDateQuery(new Date(),query);

    // build update parms
    var itemId = new ObjectID();
    var voteItem = {
        value: utilityDao.parseInteger(vote),
        itemId: itemId};

    var updateParams = {'$push': {voteList:voteItem}}

    // update meeting
    db.meetings.update(query,updateParams, function(err, count){
        callback(err, null, count, voteItem);
    })
};

var buildDateQuery = function(date,dateQuery){
    // past = more than two days in past
    var pastDate = new Date(date.getTime());
    pastDate.setDate(pastDate.getDate()-2);

    // future = more than one day in future
    var futureDate = new Date(date.getTime());
    futureDate.setDate(futureDate.getDate()+1);

    dateQuery['$and'] = [{date: {'$gte':pastDate}},{date: {'$lte': futureDate}}]
};


