RamModule
    .controller('meetingListController', function ($scope, $routeParams, meetingsDao, dataCache, utilityService, logging) {
        var thisModule = 'meetingListController';
        logging.info('starting module',thisModule);
        $scope.setStatusMessage('reading meeting list');

        var userId =  $scope.getUserIdParam();
        var meetingType = $routeParams.meetingType;

        logging.inspect(userId,thisModule);

        if (meetingType == 'future'){
            $scope.meetingTypeTitle = 'Future Meetings'
            $scope.meetingTypeSubTitle = 'scheduled after today - can not yet be rated'
        }
        else
        if (meetingType == 'past'){
            $scope.meetingTypeTitle = 'Past Meetings'
            $scope.meetingTypeSubTitle = 'more than two days in past - can no longer be rated'
        }
        else {
            $scope.meetingTypeTitle = 'Current Meetings';
            $scope.meetingTypeSubTitle = 'scheduled for today or past two days - can still be rated';
            meetingType = 'current';
        }

        meetingsDao.readMeetings(userId,meetingType, function(err){
            $scope.setStatusMessage('');
            if (err){
                $scope.errorMessage = utilityService.parseErrorMessage(err);
                return;
            }
            $scope.errorMessage = '';
        });
    });