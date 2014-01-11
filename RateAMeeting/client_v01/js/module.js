/**
 *      Rate a Meeting Module and
 *      Main Controller (parent to all other Controllers)
 *
 * Created by dgarrett on 11/21/13.
 */

var RamModule = angular.module('ramModule', []);

RamModule
    .controller('mainController', function ($scope,$location,$routeParams, logging, usersDao,dataCache) {
        var thisModule = 'mainController';
        logging.info('init module',thisModule);

        // If we are running on rh cloud,
        // switch to https for sign on
        $scope.signOnPrefix = '';
        if ($location.host().toString().toLowerCase() === 'www.rateameeting.com')
            $scope.signOnPrefix = 'https://rateameeting-anetsc.rhcloud.com/';

        logging.info('signOnPrefix: ' + $scope.signOnPrefix,thisModule);

        // Expose dataCache to views
        // to allow them to use {{dataCache.xxxxxx}}
        $scope.dataCache = dataCache;

        $scope.setStatusMessage = function (statusMessage) {
            $scope.statusMessage = statusMessage;
        };

        // Are we showing a particular view?
        // If not, return a "white" font, so graph-icon disappears
        $scope.getViewCheckMarkFont = function(viewName){
            if (dataCache.currentView && dataCache.currentView.viewName === viewName) return '';
            return 'font-white'
        };

        // Shared function to go to previous page
        $scope.goBack = function(){
            $scope.setStatusMessage('');
            window.history.back();
            return false;
        };

        $scope.getUserIdParam = function(){
            var userId = $routeParams.userId;

            if (userId && userId.trim().length === 0) userId = '0';
            else if (!userId) userId = '0';

            if (userId === '0') {
                if (dataCache.user.signedOn)
                    userId = dataCache.user._id;
                else
                    $scope.defaultUserFromSession();
            }
            $routeParams.userId = userId;
            return userId;
        };

        // if user info not present,
        // try to read user info via session
        $scope.defaultUserFromSession = function(){
            if (dataCache.user.signedOn)
                logging.info('user already cached');
            else
                usersDao.getUser(0,function(err){
                    if (!err) logging.info('re-read user via session');
                    else logging.info('user not found via session');
                });
        };

        logging.info('init done',thisModule);
    });