/**
 * Created by dgarrett on 12/24/13.
 */

RamModule.factory('faqsDao', function($http, dataCache, utilityService, logging) {
    var faqsDao = {};
    var thisModule = 'faqsDao'

    var i = -1;
    faqsDao.data = [

        {id: ++i, title: 'What browsers does th site support?', text:
            'This site has been tested on Google Chrome, Firefox, Apple Safari and Internet Explorer 10. ' +
                'Older versions of Microsoft Internet Explorer (IE 8 and earlier) will not work. ' +
                'This site is designed to run on mobile, tablet and desktop computers - any platform that ' +
                'can run a web browser and JavaScript.'
        },
        {id: ++i, title: 'What is this service?', text:
            'Rate A Meeting allows meeting attendees to rate the value of a meeting. ' +
                'You create a meeting specifying the date and description. ' +
                'Each meeting has a unique six digit number which you give to ' +
                'meeting attendees who can then enter this number ' +
                'and a rating at http://www.rateAMeeting.com. ' +
                'Meeting attendees can rate a meeting starting on the day of the meeting and up to ' +
                'two days after the meeting.'
        },
        {id: ++i, title: 'What are "Current", "Future" and "Past" meetings?', text:
            'These meeting "categories" group meetings by whether or not they can be rated now or in the future. For "Past", ' +
                'the meetings are so far in the past that they can no longer be rated. For "Current" ' +
                'the meetings are occurring today or in the last two days and can be rated. For "Future" ' +
                'the meetings are scheduled for a date after today and so can not yet be rated. There ' +
                'is also a difference in how the meeting lists are sorted. "Past" meetings lists show the most recent ' +
                'meeting first and the oldest meeting last. "Current" and "Future" meetings lists show the earliest meetings ' +
                'first and the latest last. Note also that for the free account you can only see a maximum of ' +
                '30 meetings for each category.'
        },

        {id: ++i, title: 'When can people rate a meeting?', text:
            'Meetings can be rated on the day they take place, up to two days after. To accommodate different '+
                'time zones, rating may open a day before the meeting and close up to two days after the' +
                ' scheduled meeting date.'
        },

        {id: ++i, title: 'Does this cost anything?', text:
            'This service is completely free. But there are limits to how many meetings you can see in each view.'},

        {id: ++i, title: 'What are the limits for free account?', text:
            'Free accounts will only show you a maximum of 30 Meetings in the Current, Future, and Past Meetings Lists.'
        },

        {id: ++i, title: 'Can this site run on any device?', text:
            'Yes! As long as the device can run a web page and JavaScript. This site has been designed to run on ' +
                'any platform: smart phones, tablets, desktops. To sign on and define meetings we save a session ' +
                'cookie on your device, but it contains no personal information and is not used outside of this website. ' +
                'Not only can your audience rate meetings from any device, but you can also add, edit and delete ' +
                'meetings from a smart phone  or any other web browser enabled platform.'
        },

        {id: ++i, title: 'Are the two three digit numbers unique?', text:
            'Sort of.  To keep the numbers short we may reuse numbers, but a number is verified unique ' +
                'within a 60 day window, 30 days before your meeting and 30 days after. ' +
                'This allows us to keep the numbers simple but still ensure that people do not accidentally ' +
                'rate the wrong meeting.'
        },

        {id: ++i, title: 'Can I use my browser forward and back buttons? Bookmarks?', text:
            'Yes!  This site supports complete navigation using the browser forward, back and history features. ' +
                'You can also bookmark any page within the application.'
        }

    ];

    return faqsDao;
});