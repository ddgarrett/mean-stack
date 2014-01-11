/*
 Display User Detail, Allow editing, Sign On,  Sign Off, Sign Up

 Created by dgarrett on 11/21/13.
 */

RamModule
    // View User Details
    .controller('viewUserController',
    function ($scope, $routeParams, $location, usersDao, dataCache, logging, utilityService) {
        var thisModule = 'viewUserController';
        logging.info('starting module',thisModule);
        $scope.setStatusMessage('');

        var userId =  $scope.getUserIdParam();
        dataCache.detailView = usersDao.userDisplayFields;

        $scope.editUser = function(){
            $location.path('/users/'+ dataCache.user._id +'/edit');
        };

        // Set up Detail User Fields
        $scope.fieldDisabled = true;
        $scope.buttons =
            [   {name: 'Edit', function: $scope.editUser},
                {name: 'Done', function: $scope.goBack} ];

        usersDao.getUser(userId, function(err){
            if (err){
                console.log('error reading user '+ userId);
                $scope.errorMessage = utilityService.parseErrorMessage(err);
                return;
            }
            // create copy of user
            $scope.editableDetail = utilityService.cloneJsonObject(dataCache.user);
        });

    })

    // Update User Details
    .controller('editUserController',
    function ($scope, $routeParams, $location, usersDao, dataCache, logging, utilityService) {
        var thisModule = 'editUserController';
        logging.info('starting module',thisModule);
        $scope.setStatusMessage('');

        var userId =  $scope.getUserIdParam();
        dataCache.detailView = usersDao.userEditFields;

        $scope.saveUser = function(){
            logging.info('saving user',thisModule);
            $scope.setStatusMessage('updating user...');

            $scope.errorMessage = '';
            if (!$scope.detailsForm.$valid){
                $scope.errorMessage = 'Please correct highlighted fields';
                return;
            }

            if ($scope.editableDetail.newEmail !== $scope.editableDetail.newEmailConfirm){
                $scope.errorMessage = 'New email addresses do not match';
                return;
            }
            if ($scope.editableDetail.newPassword !== $scope.editableDetail.newPasswordConfirm){
                $scope.errorMessage = 'New passwords do not match';
                return;
            }

            usersDao.updateUser(dataCache.user._id, dataCache.user, $scope.editableDetail, function(err){
                logging.info('updated user, response: '+err,thisModule);

                $scope.setStatusMessage('');
                if (err){
                    $scope.errorMessage = utilityService.parseErrorMessage(err);
                    return;
                }
                // update complete
                $scope.goBack();
            })
        };

        // Set up Detail User Fields
        $scope.fieldDisabled = false;
        $scope.buttons =
            [   {name: 'Save', function: $scope.saveUser},
                {name: 'Cancel', function: $scope.goBack} ];

        usersDao.getUser(userId, function(err){
            if (err){
                console.log('error reading user '+ userId);
                $scope.fieldDisabled = true;
                $scope.errorMessage = utilityService.parseErrorMessage(err);
                return;
            }
            // create copy of user
            $scope.editableDetail = utilityService.cloneJsonObject(dataCache.user);
            $scope.setStatusMessage('Update name or email or password, then press Save');
        });
    })

    // Sign On Controller
    .controller('signOnController', function ($scope, $location, usersDao, dataCache, logging, utilityService) {
        var thisModule = 'signOnController';
        logging.info('starting module',thisModule);
        $scope.defaultUserFromSession(); // if user not cached, try to read user via session

        $scope.setStatusMessage('');
        $scope.errorMessage = '';

        $scope.signOn = function(){
            $scope.errorMessage = '';

            if (!$scope.signOnForm.$valid){
                $scope.errorMessage = 'Please enter an email address and password.';
                return;
            }

            $scope.setStatusMessage('contacting server...');
            usersDao.signOnUser($scope.email, $scope.password, function(err){
                $scope.setStatusMessage('');
                if (err){
                    logging.error('error signing on user: '+err,thisModule);
                    $scope.errorMessage = utilityService.parseErrorMessage(err);
                    return;
                }

                var userId = dataCache.user._id;
                $location.path('/users/'+ userId + '/meetings/0');
            });
        };

        $scope.resetForm = function(){
            $scope.email = '';
            $scope.password = '';
            $scope.errorMessage = '';
        };
    })

    // Sign Off controller
    .controller('signOffController', function ($scope, $location, usersDao, dataCache, logging) {
        var thisModule = 'signOnController';
        logging.info('starting module',thisModule);

        usersDao.signOffUser(function(err){
            $location.path('/' );
        });
    })

    // Sign Up Controller
    .controller('signUpController', function ($scope, $location, usersDao, dataCache, logging, utilityService) {
        var thisModule = 'signUpController';
        logging.info('starting module',thisModule);
        $scope.defaultUserFromSession(); // if user not cached, try to read user via session

        $scope.setStatusMessage('');
        $scope.errorMessage = '';

        $scope.signUp = function(){
            $scope.errorMessage = '';

            if (!$scope.signUpForm.$valid){
                $scope.errorMessage = 'Please enter the information below.';
                return;
            }

            if ($scope.email !== $scope.email2){
                $scope.errorMessage = "Email addresses don't match";
                return;
            }

            if ($scope.password !== $scope.password2){
                $scope.errorMessage = "Passwords don't match";
                return;
            }

            $scope.setStatusMessage('contacting server...');
            usersDao.signUpUser($scope.email, $scope.password, $scope.fName, $scope.lName, function(err){
                $scope.setStatusMessage('');
                if (err){
                    logging.error('error adding new user, errMsg: '+err.errMsg,thisModule);
                    $scope.errorMessage = utilityService.parseErrorMessage(err);
                    return;
                }

                var userId = dataCache.user._id;
                $location.path('/users/'+ userId + '/meetings/0');
            });
        };

        $scope.resetForm = function(){
            $scope.fName = $scope.lName = '';
            $scope.email = '';
            $scope.password = '';
            $scope.errorMessage = '';
        };
    })
;