/**
 *  Feedback Add.
 */

var db = require('./database');  // database connection and collection cursors
var utilityDao = require('./utility.js');

var config = db.config;
var log = config.log;
var util = config.utility;

var thisModule = 'dao/feedback.js';
log.debug('initializing',thisModule);

// Below is copied from client "feedbackDao.js"
var displayFields = [
    {header: 'Name (optional)', name: 'name', type: 'text',  editable: true, placeholder: 'your name (optional)'},
    {header: 'Email (optional)', name: 'email', type: 'email', editable: true, placeholder: 'your email address (optional)'},
    {header: 'Feedback Type', name: 'type', type: 'select',  editable: true, required: true, placeholder: 'select feedback type',
        options: ['bug','question','suggestion','other'] },
    {header: 'Title / Summary', name: 'summary', type: 'text',  editable: true, required: true, placeholder: 'what is this about?'},
    {header: 'Details (optional)', name: 'details', type: 'textArea', editable: true, rows: 8, cols: 80, placeholder: 'feedback' }
];

// Add new feedback
exports.addFeedback = function(data,callback){
    log.debug('add feedback',thisModule);
    var newDocument = {postDate: new Date()};
    if (data.userId != null) newDocument.userId = data.userId;

    var errorMessage = utilityDao.buildDocument(newDocument,data,displayFields);
    if (errorMessage) return callback(null,errorMessage,null);

    db.feedback.insert(newDocument,function(err){
        callback(err,null,data);
    });
};




