/**
 * Created by dgarrett on 11/21/13.
 */

RamModule.factory('meetingsDao', function($http, usersDao, dataCache, utilityService, logging) {
    var meetingsDao = {};
    var thisModule = 'meetingDao';

    meetingsDao.submitVote = function(voteId, vote, callback){
        logging.info('in submitVote, '+voteId + ', ' + vote, thisModule);
        dataCache.vote.votedId = voteId;
        dataCache.vote.vote    = vote;
        dataCache.vote.meetingName = 'Some Meeting Name';

        // Perform REST call to Update the Meeting
        var config =
        {method: 'POST',  url: '/api/votes/' + voteId + ' /vote',
            data: {vote: vote},
            timeout: 10000 };  // want to set the timeout to 10 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                callback(data);
            })
            .error(function(data, status, headers, config) {
                logging.info('error: ',data);
                callback({data: data, status:status, headers: headers, config :config})
            });
    };

    meetingsDao.voteResultView = [
        {header: 'Meeting Number', name: 'voteIdFmt', type: 'meetingNumber'},
        {header: 'Date', name: 'date', type: 'date'},
        {header: 'Description', name: 'description', type: 'text' },
        {header: 'Your Rating', name: 'vote', type: 'number'}
    ];

    meetingsDao.readMeetingByVoteId = function(voteId,callback){
        logging.info('read meeting by voteId '+voteId,thisModule);

        // Perform REST call to get the Meeting
        var config =
        {method: 'GET',  url: '/api/votes/'+voteId,
            data: {},
            timeout: 10000 };  // want to set the timeout to 10 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                if (data.err) return callback(data);
                var result = [data];
                utilityService.formatDisplay(result,meetingsDao.voteResultView);
                dataCache.vote = result[0];
                callback(undefined);
            })
            .error(function(data, status, headers, config) {
                logging.info('error: ',data);
                callback({data: data, status:status, headers: headers, config :config})
            });
    };


    meetingsDao.pastDisplayFields = [
        {header: 'Date', name: 'date', type: 'date', editable: true, listClass:'txt-center', headerClass:'txt-center', required: true},
        {header: 'Description', name: 'description', type: 'text', editable: true, listClass:'txt-left', headerClass:'txt-left', required: true},
        {header: 'Avg Rating', name: 'avgRating', type: 'calcRating', decDigits: 2, listClass:'txt-center', headerClass:'txt-center'},
        {header: '# Ratings', name: 'votes', type: 'calcVotes', listClass:'txt-center', headerClass:'txt-center'},
        {header: 'Meeting Number', name: 'voteIdFmt', type: 'meetingNumber', listClass:'txt-center', headerClass:'txt-center'}
    ];

    meetingsDao.currentDisplayFields = [
        {header: 'Date', name: 'date', type: 'date', editable: true, listClass:'txt-center', headerClass:'txt-center', required: true},
        {header: 'Description', name: 'description', type: 'text', editable: true, listClass:'txt-left', headerClass:'txt-left', required: true},
        {header: 'Avg Rating', name: 'avgRating', type: 'calcRating', decDigits: 2, listClass:'txt-center', headerClass:'txt-center'},
        {header: '# Ratings', name: 'votes', type: 'calcVotes', listClass:'txt-center', headerClass:'txt-center'},
        {header: 'Meeting Number', name: 'voteIdFmt', type: 'meetingNumber', listClass:'txt-center', headerClass:'txt-center'},
        {header: 'Rating Link', name: 'voteLink', type: 'voteLink', listClass:'txt-left', headerClass:'txt-left'}
    ];

    meetingsDao.futureDisplayFields = [
        {header: 'Date', name: 'date', type: 'date', editable: true, listClass:'txt-center', headerClass:'txt-center', required: true},
        {header: 'Description', name: 'description', type: 'text', editable: true, listClass:'txt-left', headerClass:'txt-left'},
        {header: 'Meeting Number', name: 'voteIdFmt', type: 'meetingNumber', listClass:'txt-center', headerClass:'txt-center'},
        {header: 'Rating Link', name: 'voteLink', type: 'voteLink', listClass:'txt-left', headerClass:'txt-left'}
    ];

    meetingsDao.newMeetingDisplayFields = [
        {header: 'Date (required)', name: 'date', type: 'date', editable: true, listClass:'txt-center', headerClass:'txt-center', required: true},
        {header: 'Description (required)', name: 'description', type: 'text', editable: true, listClass:'txt-left', headerClass:'txt-left', required: true}
    ];

    meetingsDao.readMeetings = function(userId,meetingType,callback){
        dataCache.currentView = meetingsDao[meetingType+'DisplayFields'];

        usersDao.getUser(userId,function(err){
            if (err) return callback(err);

            // return if we already have the meeting list in cache
            if (meetingType !== 'current' && dataCache.meetingType === meetingType){
                logging.info('read meeting list from cache');
                callback(undefined);
                return;
            }

            dataCache.meetingType = meetingType;
            dataCache.meetings = [];

            logging.info('read meeting list from server',thisModule);

            // Perform REST call to get the Meeting
            var config =
            {method: 'GET',  url: '/api/users/'+userId+'/meetings/?meetingType='+meetingType,
                data: {},
                timeout: 10000 };  // want to set the timeout to 10 seconds

            $http(config)
                .success(function(data, status, headers, config) {
                    if (data.err) return callback(data);
                    utilityService.formatDisplay(data,dataCache.currentView);
                    dataCache.meetings = data;
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {
                    logging.info('error: ',data);
                    callback({data: data, status:status, headers: headers, config :config})
                });
        });
    };

    meetingsDao.readMeeting = function(userId,meetingId,callback){
        usersDao.getUser(userId,function(err){
            if (err) return callback(err);

            if (meetingId && typeof meetingId === 'string' && meetingId.trim().length === 0) meetingId = '0';
            else if (!meetingId) meetingId = '0';

            // return if we already have the meeting in cache
            if (dataCache.currentMeeting._id === meetingId){
                logging.info('read meeting from cache')
                callback(undefined);
                return;
            }

            logging.info('read meeting from server',thisModule);

            // Perform REST call to get the Meeting
            var config =
            {method: 'GET',  url: '/api/users/'+userId+'/meetings/'+meetingId,
                data: {},
                timeout: 10000 };  // want to set the timeout to 10 seconds

            $http(config)
                .success(function(data, status, headers, config) {
                    logging.info('success, status: '+status,thisModule);
                    if (data.err) return callback(data);
                    var tempList = [data];
                    utilityService.formatDisplay(tempList,dataCache.currentView);
                    dataCache.currentMeeting = data;
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {
                    logging.info('error: ',data);
                    callback({data: data, status:status, headers: headers, config :config})
                });
        });
    };

    // Read a meeting and set some of the $scope variables
    meetingsDao.readScopeMeeting = function(scope,userId,meetingId,status){
        scope.setStatusMessage('reading meeting');

        if (dataCache.currentView.length === 0)
            dataCache.currentView =  meetingsDao.currentDisplayFields;

        dataCache.detailView = dataCache.currentView;

        meetingsDao.readMeeting(userId,meetingId,function(err){
            if (err){
                scope.errorMessage = utilityService.parseErrorMessage(err);
                scope.setStatusMessage('');
                scope.fieldDisabled = true;
            }
            else {
                scope.errorMessage = '';
                scope.editableDetail = utilityService.cloneJsonObject(dataCache.currentMeeting);
                scope.setStatusMessage(status);
            }
        });
    };

    meetingsDao.defaultNewMeetingScope = function(scope,userId,meetingId,status){
        scope.setStatusMessage('initializing new  meeting');
        scope.errorMessage = '';
        scope.editableDetail = {userId: userId};
        dataCache.detailView =  meetingsDao.newMeetingDisplayFields;

        if (meetingId !== '0'){
            meetingsDao.readMeeting(userId,meetingId,function(err){
                if (err){
                    scope.errorMessage = utilityService.parseErrorMessage(err);
                    scope.setStatusMessage('');
                    scope.fieldDisabled = true;
                }
                else {
                    dataCache.detailView.forEach(function(field){
                        scope.editableDetail[field.name]
                            = dataCache.currentMeeting[field.name];
                    });
                    scope.setStatusMessage(status);
                }
            });
        }
        else {
            usersDao.getUser(userId,function(err){
                if (err) {
                    scope.errorMessage = utilityService.parseErrorMessage(err);
                    scope.setStatusMessage('');
                    scope.fieldDisabled = true
                }
                else{
                    scope.setStatusMessage(status);
                }
            });
        }
    };

    meetingsDao.updateMeeting = function(userId,meetingId,meetingBefore,meetingAfter,callback){
        logging.info('update meeting',thisModule);
        usersDao.getUser(userId,function(err){
            if (err) return callback(err);

            // Build the JSON structure to be sent to server
            var results = utilityService.parseUpdates(meetingBefore,meetingAfter,meetingsDao.newMeetingDisplayFields);

            if (results.errors.length > 0){
                var error = {errMsg: results.errors[0]};
                logging.info('one or more edit errors: ' + results.errors[0]);
                return callback(error);
            }

            if (!results.dataUpdated){
                logging.info('no data updated',thisModule);
                return callback(undefined);
            }

            // Perform REST call to Update the Meeting
            var config =
            {method: 'PUT',  url: '/api/users/'+userId+'/meetings/'+meetingId,
                data: results.updateData,
                timeout: 10000 };  // want to set the timeout to 10 seconds

            $http(config)
                .success(function(data, status, headers, config) {
                    if (data.err) return callback(data);
                    var tempList = [data];
                    utilityService.formatDisplay(tempList,dataCache.currentView);
                    dataCache.currentMeeting = data;
                    dataCache.clearMeetingList(); // force refresh of any list in cache
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {
                    logging.info('error: ',data);
                    callback({data: data, status:status, headers: headers, config :config})
                });
        });
    };

    meetingsDao.addMeeting = function(userId,editableMeeting,callback){
        logging.info('add meeting',thisModule);
        usersDao.getUser(userId,function(err){
            if (err) return callback(err);

            var sendData = utilityService.cloneJsonObject(editableMeeting);
            utilityService.parseDisplay(sendData,meetingsDao.newMeetingDisplayFields);

            // Perform REST call to Add the Meeting
            var config =
            {method: 'POST',  url: '/api/users/'+userId+'/meetings/',
                data: sendData,
                timeout: 10000 };  // want to set the timeout to 10 seconds

            $http(config)
                .success(function(data, status, headers, config) {
                    if (data.err) return callback(data);
                    dataCache.clearMeetingList(); // force refresh of any list in cache
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {
                    logging.info('error: ',data);
                    callback({data: data, status:status, headers: headers, config :config})
                });
        });
    };

    meetingsDao.deleteMeeting = function(userId,meetingId,callback){
        logging.info('delete meeting',thisModule);
        usersDao.getUser(userId,function(err){
            if (err) return callback(err);

            // Perform REST call to Delete the Meeting
            var config =
            {method: 'DELETE',  url: '/api/users/'+userId+'/meetings/'+meetingId,
                data: {},
                timeout: 10000 };  // want to set the timeout to 10 seconds

            $http(config)
                .success(function(data, status, headers, config) {
                    if (data.err) return callback(data);
                    dataCache.clearCurrentMeeting(); // force refresh of current meeting
                    dataCache.clearMeetingList();    // force refresh of any list in cache
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {
                    logging.info('error: ',data);
                    callback({data: data, status:status, headers: headers, config :config})
                });
        });
    };

    return meetingsDao;
});