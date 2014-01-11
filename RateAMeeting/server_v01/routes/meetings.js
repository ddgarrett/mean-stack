/**
        REST get and update Meetings
 */

var routes = require('./routes.js');
var config = routes.config;
var log = config.log;
var sessions = require('./sessions.js');

var meetingsDao = require(config.dao+'meetings.js');
var utilityDao = require(config.dao+'utility.js');

var thisModule = 'routes/meetings.js';
log.debug('initializing',thisModule);

// Get a meeting page
exports.getMeetingPage = function(req,res,next){
    sessions.defaultUserFromSession(req);
    var userId = req.params.userId;
    var meetingType = req.query.meetingType
    log.debug('getting meeting page type '+meetingType,thisModule);

    if (!sessions.requireSession(req,res)) return;

    meetingsDao.getMeetingPage(userId,meetingType,function(err,meetings){
        if (err) return next(err);
        res.json(meetings);
    })
};

// Get a meeting
exports.getMeeting = function(req,res,next){
    log.debug('get meeting',thisModule);
    sessions.defaultUserFromSession(req);
    if (!sessions.requireSession(req,res)) return

    var data = req.body;
    var userId = req.params.userId;
    var meetingId = req.params.meetingId;

    meetingsDao.getMeeting(userId,meetingId,function(err,meeting){
        if (err) return next(err);
        if (meeting === null)
            return config.res.returnNotFound(res,'meeting not found');

        res.json(meeting);
    });
};

// Add a new meeting
exports.addNewMeeting = function(req,res,next){
    sessions.defaultUserFromSession(req);
    log.debug('add new meeting',thisModule);
    if (!sessions.requireSession(req,res)) return

    var data = req.body;
    var userId = req.params.userId;

    meetingsDao.addMeeting(userId,data,function(err,editMessage,responseData){
        if (err) return next(err);
        if (editMessage)  return config.res.returnError(res,editMessage);
        res.json(responseData);
    });
};

// Update a meeting
exports.updateMeeting = function(req,res,next){
    sessions.defaultUserFromSession(req);
    log.debug('update meeting',thisModule);
    if (!sessions.requireSession(req,res)) return

    var data = req.body;
    var userId = req.params.userId;
    var meetingId = req.params.meetingId;

    meetingsDao.updateMeeting(userId,meetingId,data,function(err,editMessage,updateCount){;
        if (err) return next(err);
        if (editMessage)  return config.res.returnError(res,editMessage);
        if (updateCount === 0)
            return config.res.returnNotFound(res,'meeting not found');

        // update okay - return updated meeting
        exports.getMeeting(req,res,next);
    });
};

exports.deleteMeeting = function(req,res,next){
    sessions.defaultUserFromSession(req);
    log.debug('delete meeting',thisModule);
    if (!sessions.requireSession(req,res)) return

    var userId = req.params.userId;
    var meetingId = req.params.meetingId;

    meetingsDao.removeMeeting(userId,meetingId,function(err,updateCount){;
        if (err) return next(err);
        if (updateCount === 0)
            return config.res.returnNotFound(res,'meeting not found');

        // delete okay
        return config.res.returnOkayMessage(res,'meeting deleted');
    });
};


var downloadFields = [
    {header: 'Date', name: 'date', type: 'date', editable: true, listClass:'txt-center', headerClass:'txt-center', required: true},
    {header: 'Description', name: 'description', type: 'text', editable: true, listClass:'txt-left', headerClass:'txt-left', required: true},
    {header: 'Avg Rating', name: 'avgRating', type: 'calcRating', decDigits: 2, listClass:'txt-center', headerClass:'txt-center'},
    {header: '# Ratings', name: 'votes', type: 'calcVotes', listClass:'txt-center', headerClass:'txt-center'},
    {header: 'Meeting Number', name: 'voteIdFmt', type: 'meetingNumber', listClass:'txt-center', headerClass:'txt-center'},
    {header: 'Rating Link', name: 'voteLink', type: 'voteLink', listClass:'txt-left', headerClass:'txt-left'}
];

exports.downloadMeetings = function(req,res,next){
    sessions.defaultUserFromSession(req);
    log.debug('getting user download '+req.params.userId,thisModule);
    if (!sessions.requireSession(req,res)) return;

    res.setHeader('Content-type', 'text/csv');
    res.setHeader('Content-disposition', 'attachment; filename=collection_'+ req.params.userId +'.csv');

    meetingsDao.getDownload(req.params.userId,function(err,data){
        if (err) return next(err);
        if (data === undefined || data === null)
            return config.res.returnNotFound(res,'user not found');

        var first = true
        downloadFields.forEach(function(fieldDef){
            if (first) first = false;
            else res.write(',');
            res.write('"');
            res.write(fieldDef.header);
            res.write('"');
        });

        res.write('\r\n')

        data.forEach(function (row){
            first = true;

            // format and calculate fields
            utilityDao.formatDisplay(row,downloadFields);

            downloadFields.forEach(function(fieldDef){
                var field = row[fieldDef.name];
                if (!field) field = '';

                // change any internal \n to \r\n
                if (field.indexOf('\n') >= 0){
                    if (field.indexOf('\r') < 0){
                        log.debug('found newline withOUT carriage return',thisModule);
                        field = field.replace(/\n/g,'\r\n');
                    }
                    else {
                        log.debug('found newline with carriage return',thisModule);
                    }
                }

                // escape any "
                field = field.replace(/"/g,'""');

                if (first) first = false;
                else res.write(',');
                res.write('"');
                res.write(field);
                res.write('"');
            });
            res.write('\r\n')
        });

        res.end();
    })
};

exports.getMeetingByVoteId = function(req,res,next){
    log.debug('get meeting by voteId',thisModule);
    var voteId = req.params.voteId;

    meetingsDao.getMeetingByVoteId(voteId,function(err,meeting){
        if (err) return next(err);
        if (meeting === null)
            return config.res.returnNotFound(res,'meeting not found or not available for rating');

        res.json(meeting);
    });
};

// TODO: complete this
exports.delete = function(req,res,next){
    log.debug('delete vote for a given voteId + itemId',thisModule);
    var voteId = req.params.voteId;
    var itemId = req.params.itemId
};


exports.addMeetingVote = function(req,res,next){
    log.debug('add meeting vote',thisModule);

    var voteId = req.params.voteId;
    var vote = req.body.vote;  // vote is in data.value

    meetingsDao.addMeetingVote(voteId,vote,function(err,editMessage,updateCount,voteItem){;
        if (err) return next(err);
        if (editMessage)  return config.res.returnError(res,editMessage);
        if (updateCount === 0)
            return config.res.returnNotFound(res,'meeting not found');

        // vote okay
        // - return vote item containing value and itemId
        res.json(voteItem);
    });
};
