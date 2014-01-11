/**
 * Created by dgarrett on 11/21/13.
 */

RamModule.factory('feedbackDao', function($http, dataCache, utilityService, logging) {
    var feedbackDao = {};
     var thisModule = 'feedbackDao';

    feedbackDao.submitFeedback = function(displayData, callback){
        // Perform REST call to Post Feedback
        var config =
        {method: 'POST',  url: '/api/feedback/',
            data: displayData,
            timeout: 10000 };  // want to set the timeout to 10 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                if (data.err) return callback(data);
                callback(undefined);
            })
            .error(function(data, status, headers, config) {
                logging.info('error: ',data);
                callback({data: data, status:status, headers: headers, config :config})
            });
    };

    feedbackDao.displayFields = [
        {header: 'Name (optional)', name: 'name', type: 'text',  editable: true, placeholder: 'your name (optional)'},
        {header: 'Email (optional)', name: 'email', type: 'email', editable: true, placeholder: 'your email address (optional)'},
        {header: 'Feedback Type', name: 'type', type: 'select',  editable: true, required: true, placeholder: 'select feedback type',
            options: ['bug','question','suggestion','other'] },
        {header: 'Title / Summary', name: 'summary', type: 'text',  editable: true, required: true, placeholder: 'what is this about?'},
        {header: 'Details (optional)', name: 'details', type: 'textArea', editable: true, rows: 8, cols: 80, placeholder: 'feedback' }
    ];

    return feedbackDao;
});