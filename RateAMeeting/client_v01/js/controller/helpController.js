RamModule
    // Help - FAQ
    .controller('helpFaqController', function ($scope, faqsDao, logging) {
        var thisModule = 'helpFaqController';
        logging.info('starting module',thisModule);
        $scope.setStatusMessage('');
        $scope.defaultUserFromSession(); // if user not cached, try to read user via session

        $scope.faqs = faqsDao.data;

        $scope.toggleFaq = function(i){
            $scope.faqs[i].visible = !$scope.faqs[i].visible;
        };

        $scope.setAllVisible = function(value){
            $scope.faqs.forEach(function(faq){
                faq.visible = value;
            })
        };
    })

    // Help - Contact Us
    .controller('helpContactController', function ($scope, feedbackDao, dataCache, utilityService, logging) {
        var thisModule = 'helpContactController';
        logging.info('starting module',thisModule);
        $scope.setStatusMessage('');
        $scope.defaultUserFromSession(); // if user not cached, try to read user via session

        $scope.title = 'Contact Us';

        dataCache.detailView = feedbackDao.displayFields;

        $scope.submitFeedback = function(){
            $scope.errorMessage = '';
            if (!$scope.detailsForm.$valid){
                $scope.errorMessage = 'Please correct highlighted fields';
                return;
            }

            $scope.setStatusMessage('submitting feedback...');
            feedbackDao.submitFeedback($scope.editableDetail, function(err){
                $scope.setStatusMessage('');
                if (err){
                    $scope.errorMessage = utilityService.parseErrorMessage(err);
                    return;
                }
                // update complete
                $scope.goBack();
            })
        };

        // Set up Detail Fields
        $scope.fieldDisabled = false;
        $scope.buttons =
            [   {name: 'Submit', function: $scope.submitFeedback},
                {name: 'Cancel', function: $scope.goBack} ];

        $scope.editableDetail = {};
        $scope.setStatusMessage('Please enter your comments then press Submit');
    })

    // Help - About
    .controller('helpAboutController', function ($scope, logging) {
        var thisModule = 'helpAboutController';
        logging.info('starting module',thisModule);
        $scope.setStatusMessage('');
        $scope.defaultUserFromSession(); // if user not cached, try to read user via session
    })
;

