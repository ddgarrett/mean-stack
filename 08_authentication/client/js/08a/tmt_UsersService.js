/*
    Users Service
    Factory - Return an instance of a Users Service
 */
tmtModule.factory('TmtUsers', function($http, TmtUtilities, $browser) {
    var TmtUsers = {};

    // define users properties, including functions
    TmtUsers.user = undefined;   // detailed user information
    TmtUsers.defaultViewId = undefined;

    TmtUsers.signonUser = function(email,password,callback){
       // Perform REST call to Signon User
        var config =
        {method: 'POST',  url: '/api/signon',
            data : {email:email, password:password},
            timeout: 10000 };  // want to set the timeout to 5 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                TmtUsers.user = data;
                TmtUsers.defaultViewId = TmtUsers.getDefaultViewId();
                callback(undefined);
            })
            .error(function(data, status, headers, config) {
                TmtUsers.user = undefined;
                callback({data: data, status:status, headers: headers, config :config})
            });
    };

    TmtUsers.getUser = function(userId, callback){
        // Check to see if we've already read the User
        // User is identified by either an _id or an email address
        if (TmtUsers.user !== undefined
        && (userId == TmtUsers.user._id || userId == TmtUsers.user.email )) {
            callback(undefined);
            return;
        }

        // Perform REST call to read User
        var config =
            {method: 'GET',  url: '/api/users/'+userId,
            timeout: 5000 };  // want to set the timeout to 5 seconds

        $http(config)
            .success(function(data, status, headers, config) {
                TmtUsers.user = data;
                TmtUsers.defaultViewId = TmtUsers.getDefaultViewId();
                callback(undefined);
            })
            .error(function(data, status, headers, config) {
                TmtUsers.user = undefined;
                callback({data: data, status:status, headers: headers, config :config})
            });
    };

    // Find the View ID for the Default View
    // of the Default Collection for the current User
    TmtUsers.getDefaultViewId = function(){
        if (TmtUsers.user === undefined && TmtUsers.user.collections === undefined) return undefined;
        var defaultCollection = TmtUsers.user.defaultCollection;
        var collection = TmtUtilities.findInArray(TmtUsers.user.collections,defaultCollection);
        return collection.defaultView;
    };

    TmtUsers.updateUser = function(newUser, callback){
        if (!newUser || !newUser._id){
            callback (TmtUtilities.buildError('invalid user passed to updateUser'));
            return;
        }

        // Make sure we have read this user
        TmtUsers.getUser(newUser._id, function(err){
            if (err){
                callback(err);
                return;
            }

            var modified = false;
            ['lName','fName'].forEach( function(fieldName) {
                if (TmtUsers.user[fieldName] !== newUser[fieldName]){
                    modified = true;
                    TmtUsers.user[fieldName] = newUser[fieldName];
                }
            });

            if (!modified){
                callback(undefined);
                return;
            }

            // Perform REST call to Put User
            var config =
                {method: 'PUT',  url: '/api/users/'+TmtUsers.user._id,
                   data: newUser,
                timeout: 10000 };  // want to set the timeout to 10 seconds

            $http(config)
                .success(function(data, status, headers, config) {
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {

                    callback({data: data, status:status, headers: headers, config :config})
                });
        });
    };

    return TmtUsers;
});
