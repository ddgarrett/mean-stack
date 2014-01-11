/**
 *      Rate a Meeting Module and Routes
 *
 * Created by dgarrett on 11/21/13.
 */

RamModule
    .config( function ($routeProvider) {
        console.log('setting up routes');

        $routeProvider.
            // Default to "meeting vote" view
            when('/', {
                controller: 'voteController',
                templateUrl: 'views/vote.html'
            }).
            // link to prepopulated vote page
            when('/vote/:voteId', {
                controller: 'voteController',
                templateUrl: 'views/vote.html'
            }).
            // Confirm Rating made for a specified meeting
            when('/confirmVote/:voteId/vote/:vote/item/:itemId', {
                controller: 'confirmVoteController',
                templateUrl: 'views/data_detail.html'
            }).

            // "Sign On" view
            when('/signOn', {
                controller: 'signOnController',
                templateUrl: 'views/sign_on.html'
            }).
            // "Sign Off" view
            when('/signOff', {
                controller: 'signOffController',
                templateUrl: 'views/sign_on.html'
            }).
            // "Sign Up" view
            when('/signUp', {
                controller: 'signUpController',
                templateUrl: 'views/sign_up.html'
            }).

            // Define "Meetings" url
            when('/users/:userId/meetings/', {
                controller: 'meetingListController',
                templateUrl: 'views/meeting_list.html'
            }).
            when('/users/:userId/meetings/:meetingType', {
                controller: 'meetingListController',
                templateUrl: 'views/meeting_list.html'
            }).

            // Define "detail" url
            when('/users/:userId/meetings/:meetingId/detail', {
                controller: 'viewMeetingDetailController',
                templateUrl: 'views/data_detail.html'
            }).
            // Define edit "detail" url
            when('/users/:userId/meetings/:meetingId/edit', {
                controller: 'editMeetingDetailController',
                templateUrl: 'views/data_detail.html'
            }).
            // Define new "detail" url
            // If meetingId non-zero, copies that meeting for default values
            when('/users/:userId/meetings/:meetingId/new', {
                controller: 'newMeetingDetailController',
                templateUrl: 'views/data_detail.html'
            }).
            // Define delete "detail" url
            when('/users/:userId/meetings/:meetingId/delete', {
                controller: 'deleteMeetingDetailController',
                templateUrl: 'views/data_detail.html'
            }).

            // Define "View User Profile" url
            when('/users/:userId', {
                controller: 'viewUserController',
                templateUrl: 'views/data_detail.html'
            }).
            // Define "Edit User Profile" url
            when('/users/:userId/edit', {
                controller: 'editUserController',
                templateUrl: 'views/data_detail.html'
            }).

            // Define "helpController.js" - Related Functions
            when('/help/faq', {
                controller: 'helpFaqController',
                templateUrl: 'views/faqs.html'
            }).
            when('/help/contact', {
                controller: 'helpContactController',
                templateUrl: 'views/data_detail.html'
            }).
            when('/help/about', {
                controller: 'helpAboutController',
                templateUrl: 'views/about.html'
            }).

            // Default if none of the above
            otherwise({
                redirectTo: '/'
            });
    })

;