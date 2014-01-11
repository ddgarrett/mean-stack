/*
 Display User Detail and allow editing

 Created by dgarrett on 11/21/13.
 */

RamModule
    // Common functions for Meeting Vote Controller
    .factory('meetingVoteCommon', function(meetingsDao, dataCache, utilityService, logging) {
        var meetingVoteCommon = {};
        var thisModule = 'meetingVoteCommon';
        logging.info('starting module',thisModule);

        // Common read of Meeting by VoteId
        meetingVoteCommon.readScopeMeetingByVoteId = function(scope,voteId,callback){
            dataCache.vote = {};
            scope.editableDetail = {};
            scope.errorMessage = '';

            if (!voteId) return;

            voteId = utilityService.removeNonNumeric(voteId);

            scope.errorMessage = 'reading meeting...';

            meetingsDao.readMeetingByVoteId(voteId,function(err){
                if (err){
                    scope.errorMessage = utilityService.parseErrorMessage(err);
                }
                else {
                    scope.errorMessage = '';
                    logging.inspect(dataCache.vote);
                    scope.editableDetail = dataCache.vote;
                    callback();
                }
            });
        };

        return meetingVoteCommon;
    })

    // Allow entry of a vote for voteId: /vote/:voteID
    .controller('voteController',
    function ($scope, $routeParams, $location, meetingsDao, meetingVoteCommon, dataCache, utilityService, logging) {
        var thisModule = 'voteController';
        logging.info('starting module',thisModule);

        $scope.voteId = $routeParams.voteId;
        $scope.defaultUserFromSession(); // if user not cached, try to read user via session

        $scope.setStatusMessage('');
        $scope.errorMessage = undefined;

        $scope.prompt = 'Enter Meeting Number and Select Rating';

        $scope.verifyMeeting = function(){
            meetingVoteCommon.readScopeMeetingByVoteId($scope,$scope.voteId,function(){
                $scope.prompt = 'Select a Rating for this meeting';
            });
        };

        $scope.verifyMeeting();

        $scope.saveVote = function(vote){
            logging.info('in saveVote',thisModule);
            $scope.errorMessage = '';
            if (!$scope.voteForm.$valid){
                logging.info('invalid form',thisModule);
                $scope.errorMessage = 'Please enter a meeting number';
                return;
            }

            $scope.errorMessage = 'submitting rating';

            var voteId = $scope.voteId;

            /*
            var dashLoc = voteId.indexOf('-');
            if (dashLoc > 0 && dashLoc < voteId.length- 1){
                voteId = voteId.substring(0,dashLoc) + voteId.substring(dashLoc+1);
            }
            */

            voteId = utilityService.removeNonNumeric(voteId);

            meetingsDao.submitVote(voteId, vote, function(data){
                if (data.status && data.status === 404){
                    $scope.errorMessage = 'meeting not found or not available for rating';
                    return;
                }

                if (!data.itemId){
                    $scope.errorMessage = utilityService.parseErrorMessage(data.err);
                    logging.error('error: '+$scope.prompt,thisModule);
                    return;
                }

                // vote submission complete
                $location.path('/confirmVote/'+voteId+'/vote/'+vote+'/item/'+data.itemId);
            });
        };
    })

    // Confirm rating submitted
    .controller('confirmVoteController',
    function ($scope, $routeParams, $location, meetingVoteCommon, meetingsDao, dataCache, utilityService, logging) {
        var thisModule = 'confirmVoteController';
        logging.info('starting module',thisModule);
        $scope.defaultUserFromSession(); // if user not cached, try to read user via session

        $scope.undoVote = function(){
            // TODO: add code to undo using voteId and itemId
            // from dataCache.vote
            // then go back to voting page
            $scope.setStatusMessage('Sorry... this function is not yet implemented.');
        };

        $scope.goHome = function(){
            $location.path('/');
        };

        // Set up Detail Meeting Fields
        $scope.setStatusMessage('');
        $scope.fieldDisabled = true;
        $scope.buttons =
            [   {name: 'Home Page', function: $scope.goHome},
                {name: 'Change Rating', function: $scope.undoVote} ];


        dataCache.detailView = meetingsDao.voteResultView;

        meetingVoteCommon
            .readScopeMeetingByVoteId($scope,$routeParams.voteId,function(){
                $scope.editableDetail.vote = $routeParams.vote;
                $scope.setStatusMessage('Thank you for your rating!');
            });
    })

;