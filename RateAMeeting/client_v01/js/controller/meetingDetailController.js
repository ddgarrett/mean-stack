/*
 Details for a Meeting

 */

// TODO: move readScopeMeeting to a viewMeetingDetailCommon service? See meetingVoteController for example
RamModule
    .controller('viewMeetingDetailController',
    function ($scope, $routeParams, $location, meetingsDao, dataCache, utilityService, logging) {
        var thisModule = 'viewMeetingDetailController';
        logging.info('starting module',thisModule);

        var userId =  $scope.getUserIdParam();
        var meetingId = $routeParams.meetingId;

        $scope.editDetail = function(){
            $location.path('/users/'+dataCache.user._id+'/meetings/'+meetingId+'/edit');
        };

        // Set up Detail Meeting Fields
        $scope.fieldDisabled = true;
        $scope.buttons =
            [   {name: 'Edit', function: $scope.editDetail},
                {name: 'Done', function: $scope.goBack} ];

        meetingsDao.readScopeMeeting($scope,userId,meetingId,'');
    })

    .controller('editMeetingDetailController',
    function ($scope, $routeParams, meetingsDao, dataCache, utilityService, logging) {
        var thisModule = 'editMeetingDetailController';
        logging.info('starting module',thisModule);
        $scope.setStatusMessage('');

        var userId =  $scope.getUserIdParam();
        var meetingId = $routeParams.meetingId;

        $scope.saveMeeting = function(){
            $scope.errorMessage = '';
            if (!$scope.detailsForm.$valid){
                $scope.errorMessage = 'Please correct errors.';
                return;
            }

            $scope.setStatusMessage('updating meeting...');
            meetingsDao.updateMeeting(userId,meetingId,dataCache.currentMeeting,$scope.editableDetail, function(err){
                $scope.setStatusMessage('');
                if (err){
                    $scope.errorMessage = utilityService.parseErrorMessage(err);
                    return;
                }
                // update complete
                $scope.goBack();
            })
        };

        // Set up New Meeting Fields
        $scope.fieldDisabled = false;
        $scope.buttons =
            [   {name: 'Save' , function: $scope.saveMeeting},
                {name: 'Cancel', function: $scope.goBack} ];

        meetingsDao.readScopeMeeting($scope,userId,meetingId,'Update information then press "Save"');
    })

    .controller('newMeetingDetailController',
    function ($scope, $routeParams, meetingsDao, utilityService, dataCache, logging) {
        var thisModule = 'newMeetingDetailController';
        logging.info('starting module',thisModule);
        $scope.setStatusMessage('');

        var userId =  $scope.getUserIdParam();
        var meetingId = $routeParams.meetingId;

        $scope.addMeeting = function(){
            $scope.errorMessage = '';
            if (!$scope.detailsForm.$valid){
                $scope.errorMessage = 'Please correct errors.';
                return;
            }

            $scope.setStatusMessage('adding new meeting...');
            meetingsDao.addMeeting(userId,$scope.editableDetail, function(err){
                $scope.setStatusMessage('');
                if (err){
                    $scope.errorMessage = utilityService.parseErrorMessage(err);
                    return;
                }
                // update complete
                $scope.goBack();
            })
        };

        $scope.fieldDisabled = false;
        $scope.buttons =
            [   {name: 'Add' ,   function: $scope.addMeeting},
                {name: 'Cancel', function: $scope.goBack} ];

        meetingsDao.defaultNewMeetingScope($scope,userId,meetingId,'Enter information then press "Add"');
    })

    .controller('deleteMeetingDetailController',
    function ($scope, $routeParams, meetingsDao, utilityService, dataCache, logging) {
        var thisModule = 'deleteMeetingDetailController';
        logging.info('starting module',thisModule);

        var userId =  $scope.getUserIdParam();
        var meetingId = $routeParams.meetingId;

        $scope.deleteMeeting = function(){
            $scope.setStatusMessage('deleting meeting...');
            meetingsDao.deleteMeeting(userId,meetingId, function(err){
                $scope.setStatusMessage('');
                if (err){
                    $scope.errorMessage = utilityService.parseErrorMessage(err);
                    return;
                }
                // delete complete
                $scope.goBack();
            })
        };

        // Set up Editable Detail View fields
        $scope.fieldDisabled = true;
        $scope.buttons =
            [   {name: 'Delete' ,function: $scope.deleteMeeting},
                {name: 'Cancel', function: $scope.goBack} ];

        meetingsDao.readScopeMeeting($scope,userId,meetingId,'Confirm Meeting Delete');
    })
;








