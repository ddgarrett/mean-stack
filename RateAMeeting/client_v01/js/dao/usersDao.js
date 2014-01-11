/**
 * Created by dgarrett on 11/21/13.
 */

RamModule.factory('usersDao', function($http, dataCache, utilityService, logging) {
    var usersDao = {};
    var thisModule = 'userDao';

    var readFields = {fName:1, lName:1, email:1 } ;
    usersDao.userDisplayFields = [
        {header: 'First Name', name: 'fName', type: 'text' },
        {header: 'Last Name',  name: 'lName', type: 'text' },
        {header: 'Email',      name: 'email', type: 'email'}
    ];

    usersDao.userEditFields = [
        {header: 'First Name',      name: 'fName', type: 'text',  editable: true, required: true, placeholder: 'first name'},
        {header: 'Last Name',       name: 'lName', type: 'text',  editable: true, required: true, placeholder: 'last name'},
        {header: 'Current Email',   name: 'email', type: 'email' },
        {header: 'New Email',       name: 'newEmail',       type: 'email',   editable: true, placeholder: 'new email address'},
        {header: 'Confirm Email',   name: 'newEmailConfirm',type: 'email',   editable: true, placeholder: 'confirm email address'},
        {header: 'New Password',    name: 'newPassword',        type: 'password', editable: true, placeholder: 'new password'},
        {header: 'Confirm Password',name: 'newPasswordConfirm', type: 'password', editable: true, placeholder: 'confirm new password'}
    ];

    // Base array of fields which are updated
    // Used to build JSON to be sent to server
    // Additional fields may be added to a copy of this array, including email and password
    usersDao.userUpdateFields = [
        {header: 'First Name',      name: 'fName', type: 'text',  editable: true, required: true},
        {header: 'Last Name',       name: 'lName', type: 'text',  editable: true, required: true}
    ];

    // HashMap of fields which "may" be updated
    // Will be added selectively to a copy of userUpdateFields array by updateUser
    usersDao.optionalUpdateFields = {
        email:    {header: 'New Email',       name: 'email',    type: 'email',    editable: true, required: true},
        password: {header: 'New Password',    name: 'password', type: 'password', editable: true, required: true}
    };

    usersDao.signOnUser = function(email,password, callback){

        // Perform REST call to Post a Sign On Call
        var config =
        {method: 'POST',  url: '/api/signOn/',
            data: {email: email, password: password},
            timeout: 10000 };  // want to set the timeout to 10 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                if (data.err) return callback(data);

                dataCache.user = data;
                dataCache.user.signedOn = true;

                callback(undefined);
            })
            .error(function(data, status, headers, config) {
                logging.info('error: ',data);
                callback({data: data, status:status, headers: headers, config :config})
            });
    };

    usersDao.signOffUser = function(callback){
        // clear all cached data
        dataCache.clearData();

        // Perform REST call to Post a Sign Off
        var config =
        {method: 'POST',  url: '/api/signOff/',
            data: {},
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

    usersDao.signUpUser = function(email,password, fName,lName, callback){
        logging.info('sign up new user',thisModule);
        var newUser = {
            email: email, password: password,
            fName:fName,   lName: lName
        };

        // Perform REST call to Post New User
        var config =
        {method: 'POST',  url: '/api/users/',
            data: newUser,
            timeout: 10000 };  // want to set the timeout to 10 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                if (data.err) return callback(data);

                dataCache.user = data;
                dataCache.user.signedOn = true;

                callback(undefined);
            })
            .error(function(data, status, headers, config) {
                logging.info('error: ',data);
                callback({data: data, status:status, headers: headers, config :config})
            });
    };

    usersDao.getUser = function(userId, callback){
        if (typeof userId === 'string' && userId.toString().trim().length === 0) userId = '0'
        logging.info('getUser '+userId,thisModule);

        // return if we already have the user in cache
        // if "0" is passsed, use currently cached userId
        if (dataCache.user._id === userId
            || (userId === "0" && dataCache.user._id)){
            callback(undefined);
            return;
        }

        logging.info('read user from server',thisModule);

        // Perform REST call to get the User
        var config =
        {method: 'GET',  url: '/api/users/'+userId,
            data: {},
            timeout: 10000 };  // want to set the timeout to 10 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                if (data.err) return callback(data);

                dataCache.user = data;
                dataCache.user.signedOn = true;

                callback(undefined);
            })
            .error(function(data, status, headers, config) {
                logging.info('error: ',data);
                callback({data: data, status:status, headers: headers, config :config})
            });
    };

    usersDao.updateUser = function(userId,userDataBefore,userDataAfter,callback){
        logging.info('update user '+userId,thisModule);

        var updateFields = utilityService.cloneJsonObject(usersDao.userUpdateFields);

        // If the email address or password were updated,
        // add them to the list of updated fields
        if (userDataAfter.newEmail && userDataAfter.newEmail.trim().length > 0){
            updateFields.push(usersDao.optionalUpdateFields.email);
            userDataAfter.email = userDataAfter.newEmail;
        }
        if (userDataAfter.newPassword && userDataAfter.newPassword.trim().length > 0){
            updateFields.push(usersDao.optionalUpdateFields.password);
            userDataAfter.password = userDataAfter.newPassword;
        }

        // Build the JSON structure to be sent to server
        var results = utilityService.parseUpdates(userDataBefore,userDataAfter,updateFields);

        if (results.errors.length > 0){
            var error = {errMsg: results.errors[0]};
            logging.info('one or more edit errors: ' + results.errors[0]);
            return callback(error);
        }

        if (!results.dataUpdated){
            logging.info('no data updated',thisModule);
            return callback(undefined);
        }

        // Perform REST call to get the User
        var config =
        {method: 'PUT',  url: '/api/users/'+userId,
            data: results.updateData,
            timeout: 10000 };  // want to set the timeout to 10 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                if (data.err) return callback(data);
                dataCache.user = data;
                dataCache.user.signedOn = true;
                callback(undefined);
            })
            .error(function(data, status, headers, config) {
                logging.info('error: ',data);
                callback({data: data, status:status, headers: headers, config :config})
            });
    };

    return usersDao;
});
