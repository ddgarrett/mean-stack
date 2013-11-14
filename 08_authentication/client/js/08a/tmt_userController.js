/*
    Display User Detail and allow ingedit
 */
tmtModule

.controller('viewUserController', function ($scope, $routeParams, $location, TmtUsers, TmtUtilities) {
    $scope.setStatusMessage('');
    $scope.setShowingCollection(false);
    $scope.userId = $routeParams.userId;
    $scope.setMenu('tmt_user_menu.html');

    $scope.editUser = function(){
        $location.path('/app/users/'+ $scope.userId +'/edit');
    };

    // Set up User View fields
    $scope.fieldDisabled = true;
    $scope.buttonOneFunction = $scope.editUser;
    $scope.buttonOneName = "Edit";
    $scope.buttonTwoFunction = $scope.goBack;
    $scope.buttonTwoName = "Done";

    $scope.setStatusMessage('Reading user');
    TmtUsers.getUser($scope.userId, function(err){
        $scope.setStatusMessage('');
        if (err){
            console.log('error reading user '+ $scope.userId);
            $scope.errorMessage = TmtUtilities.parseErrorMessage(err);
            return;
        }
        // create copy of user
        $scope.editableUser = TmtUtilities.cloneJsonObject(TmtUsers.user);
    });

})
.controller('editUserController', function ($scope, $routeParams, $location, TmtUsers, TmtUtilities) {
    $scope.setShowingCollection(false);
    $scope.userId = $routeParams.userId;
    $scope.setMenu('tmt_user_menu.html');

    $scope.saveUser = function(){
        $scope.setStatusMessage('updating user...');
        $scope.errorMessage = '';
        if (!$scope.userForm.$valid){
            $scope.errorMessage = 'Please enter both first and last name.';
            return;
        }

        TmtUsers.updateUser($scope.editableUser, function(err){
            $scope.setStatusMessage('');
            if (err){
                $scope.errorMessage = TmtUtilities.parseErrorMessage(err);
                return;
            }
            // update complete
            $scope.goBack();
        })
    };

    // Set up user edit fields
    $scope.setStatusMessage('');
    $scope.fieldDisabled = false;
    $scope.buttonOneFunction = $scope.saveUser;
    $scope.buttonOneName = "Save";
    $scope.buttonTwoFunction = $scope.goBack;
    $scope.buttonTwoName = "Cancel";

    $scope.setStatusMessage('Reading user');
    TmtUsers.getUser($scope.userId, function(err){
        $scope.setStatusMessage('');
        if (err){
            $scope.editableUser = undefined;
            $scope.errorMessage = TmtUtilities.parseErrorMessage(err);
            return;
        }
        // create copy of user and edit that
        $scope.editableUser = TmtUtilities.cloneJsonObject(TmtUsers.user);
        $scope.setStatusMessage('Update information then press "Save"');
    });
})
;