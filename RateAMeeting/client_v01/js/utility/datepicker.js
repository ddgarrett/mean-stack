/**
 * Created by dgarrett on 12/21/13.
 */
/*
 Directive to interface with JQuery UI Date Picker.
 From book "AngularJS" by Brad Green and Shyam Seshadri
 Chapter 8 Datepicker.

 Updated to remove the "scope:" attribute in order to work
 within ng-repeats, per stack overflow post at
 http://stackoverflow.com/questions/16618621/angularjs-pass-instance-of-each-ng-repeat-in-html-to-directive
 by sh0ber on May 17, 2013 (many thanks!!!!)
 */

RamModule
    .directive('datepicker', function() {
        return {
            // Enforce the angularJS default of restricting the directive to
            // attributes only
            restrict: 'A',
            // Always use along with an ng-model
            require: '?ngModel',
            // This method needs to be defined and passed in from the
            // passed in to the directive from the view controller

            link: function(e, element, attrs, ngModel) {
                if (!ngModel) return;

                var optionsObj = {};

                optionsObj.dateFormat = 'mm/dd/yy';
                var updateModel = function(dateTxt) {
                    e.$apply(function () {
                        // Call the internal AngularJS helper to
                        // update the two way binding
                        ngModel.$setViewValue(dateTxt);
                    });
                };

                optionsObj.onSelect = function(dateTxt, picker) {
                    updateModel(dateTxt);
                    if (e.select) {
                        e.$apply(function() {
                            e.select({date: dateTxt});
                        });
                    }
                };

                ngModel.$render = function() {
                    // Use the AngularJS internal 'binding-specific' variable
                    element.datepicker('setDate', ngModel.$viewValue || '');
                };
                element.datepicker(optionsObj);
            }
        };
    });
