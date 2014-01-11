tmtModule
    .config( function ($routeProvider) {
        var template = function(templateName){
            return 'views/08a/' + templateName
        };

        $routeProvider.
            // Default to "signon" view
            when('/', {
                controller: 'signonController',
                templateUrl: template('tmt_signon_view.html')
            }).
            // Define "list" url
            when('/app/users/:userId/views/:viewId/pages', {
                controller: 'listController',
                templateUrl: template('tmt_list_view.html')
            }).
            when('/app/users/:userId/views/:viewId/pages/:pageNumber', {
                controller: 'listController',
                templateUrl: template('tmt_list_view.html')
            }).
            // Define "detail" url
            when('/app/users/:userId/views/:viewId/details/:dataId', {
                controller: 'detailController',
                templateUrl: template('tmt_detail_view.html')
            }).
            // Define edit "detail" url
            when('/app/users/:userId/views/:viewId/details/:dataId/edit', {
                controller: 'editDetailController',
                templateUrl: template('tmt_detail_view.html')
            }).
            // Define "View User Profile" url
            when('/app/users/:userId', {
                controller: 'viewUserController',
                templateUrl: template('tmt_user_view.html')
            }).
            // Define "Edit User Profile" url
            when('/app/users/:userId/edit', {
                controller: 'editUserController',
                templateUrl: template('tmt_user_view.html')
            }).
            // Default if none of the above
            otherwise({
                redirectTo: '/'
            });
    })

;