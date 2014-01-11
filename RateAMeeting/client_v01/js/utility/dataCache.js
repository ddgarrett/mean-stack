/**
 * Created by dgarrett on 11/21/13.
 */

RamModule.factory('dataCache', function() {
    var dataCache = {};

    dataCache.clearData = function(){
        dataCache.user = {signedOn: false};
        dataCache.meetingType = ''; // type of meetings shown: past, current, future
        dataCache.meetings = [];
        dataCache.currentMeeting = {};
        dataCache.vote = {};
        dataCache.currentView = [];
        dataCache.pageList = [
        ];

        dataCache.vote = {};

        dataCache.voteOptions = [
            {myValue: 'not useful - 1', vote: 1, myClass: ''},
            {myValue: '2', vote: 2, myClass: ''},
            {myValue: '3', vote: 3, myClass: ''},
            {myValue: '4', vote: 4, myClass: ''},
            {myValue: '5 - very useful', vote: 5, myClass: ''}
        ];
    };

    // clear the list of meetings
    // used after add, change, delete to force refresh of any meeting lists being shown
    dataCache.clearMeetingList = function(){
        dataCache.meetingType = '';
        dataCache.meetings = [];
    };

    // clear the current meeting in cache
    // used after delete to force refresh of any meeting data
    dataCache.clearCurrentMeeting = function(){
        dataCache.currentMeeting = {};
    };

    dataCache.clearData();
    return dataCache;
});
