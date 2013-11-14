/*
    TMT Signon Controller - manage view for user signon and authentication.
 */

tmtModule
    .controller('signonController', function ($scope, $location, TmtUsers, TmtUtilities) {
        $scope.setStatusMessage('');
        $scope.setShowingCollection(false);

        $scope.setMenu('tmt_signon_menu.html');
        $scope.errorMessage = '';
        $scope.setStatusMessage('');

        // For testing only: preset email and password
        $scope.email = 'j.smith@nowhere.com';
        $scope.password = 'abcd';

        $scope.signon = function(){
            $scope.errorMessage = '';

            if (!$scope.signonForm.$valid){
                $scope.errorMessage = 'Please enter an email address and password.';
                return;
            }

            $scope.setStatusMessage('contacting server...');
            TmtUsers.signonUser($scope.email, $scope.password, function(err){
                $scope.setStatusMessage('');
                if (err){
                    console.dir(err);
                     $scope.errorMessage = TmtUtilities.parseErrorMessage(err);
                    return;
                }

                var userId = TmtUsers.user._id;
                var viewId = TmtUsers.getDefaultViewId();
                $location.path('/app/users/'+ userId +'/views/'+ viewId +'/pages');
            });
        };

        $scope.resetForm = function(){
            $scope.email = '';
            $scope.password = '';
            $scope.errorMessage = '';
        };
    });

