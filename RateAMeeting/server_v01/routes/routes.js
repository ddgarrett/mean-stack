/**
    Define Routes
 */
var config = require('../config.js');  // Configuration file
exports.config = config;

var log = config.log;
var thisModule = 'routes/routes.js';
log.debug('initializing',thisModule);

var users     = require('./users.js');
var meetings  = require('./meetings.js');
var views     = require('./views.js');
var feedback  = require('./feedback.js');

exports.defineRoutes = function(app){
    log.debug('defining routes',thisModule);

    // TODO: add route for voting

    // Define Routes
    app.post('/api/feedback', feedback.addFeedback);

    app.post('/api/users',   users.addNewUser);
    app.post('/api/signOn',  users.signOn);
    app.post('/api/signOff', users.signOff);
    app.get('/api/users/:userId', users.getUser);
    app.put('/api/users/:userId', users.updateUser);

    app.get('/api/users/:userId/meetings/', meetings.getMeetingPage);
    app.get('/api/users/:userId/meetings/:meetingId', meetings.getMeeting);

    app.post('/api/users/:userId/meetings', meetings.addNewMeeting);
    app.put('/api/users/:userId/meetings/:meetingId', meetings.updateMeeting);
    app.delete('/api/users/:userId/meetings/:meetingId', meetings.deleteMeeting);

    app.get('/api/votes/:voteId', meetings.getMeetingByVoteId);
    // app.delete('/api/votes/:voteId/item/:itemId', meetings.deleteVote);
    app.post('/api/votes/:voteId/vote', meetings.addMeetingVote);

    app.get('/api/users/:userId/downloads', meetings.downloadMeetings);
};
