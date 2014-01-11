'strict mode';

var tmtModule = angular.module('TmtModule', []);

// Track My Things Controller
tmtModule
.controller('TmtCntl', function ($scope, $http, TmtUsers, TmtViews, TmtUtilities) {
    $scope.someDate = '';
    $scope.menuLocation = 'views/08a/';
    $scope.statusMessage = '';
    $scope.TmtUsers = TmtUsers;
    $scope.TmtViews = TmtViews;
    $scope.TmtUtilities = TmtUtilities;

    $scope.showingCollection = false;

    $scope.setMenu = function(menuView){
        $scope.mainMenu = $scope.menuLocation + menuView
     };

    $scope.setStatusMessage = function (statusMessage) {
        $scope.statusMessage = statusMessage;
    };

    // If the passed collection is the "currentCollection"
    // return empty string, else return "font-white" to hide the menu Checkmark
    $scope.getSubsCollCheckmarkFont = function(_id){
        if (TmtViews.currentCollection && TmtViews.currentCollection._id === _id) return '';
        return 'font-white'
    };

    // If the passed view is the "currView" (current view)
    // return empty string, else return "font-white" to hide the menu Checkmark
    $scope.getViewCheckmarkFont = function(_id){
        if (TmtViews.currentView && TmtViews.currentView._id === _id) return '';
        return 'font-white'
    };

    // Keep track: are we showing a collection or not?
    $scope.setShowingCollection = function(booleanValue){
        $scope.showingCollection = booleanValue;
    };
    $scope.showingCollectionCheckmark = function(){
        if ($scope.showingCollection) return '';
        return 'font-white'
    };
    $scope.showingProfileCheckmark = function(){
        if ($scope.showingCollection) return 'font-white';
        return ''
    };

    // Shared function to go to previous page
    $scope.goBack = function(){
        $scope.setStatusMessage('');
        window.history.back();
        return false;
    };
})

;

