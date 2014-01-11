/*
    Display Details of a Single View Item

    Question: need to get formatted version somewhere? During clone?
    Question: need to parse input somewhere, during edit/save?
 */
tmtModule
.controller('detailController',
     function ($scope, $routeParams, $location, TmtViews, TmtUtilities) {
         $scope.setStatusMessage('');
        $scope.setShowingCollection(true);
        var userId = $routeParams.userId;
        var viewId = $routeParams.viewId;
        var dataId = $routeParams.dataId;
        $scope.setMenu('tmt_detail_menu.html');

        $scope.editDetail = function(){
           $location.path('/app/users/'+userId+'/views/'+viewId+'/details/'+dataId+'/edit');
        };

        // Set up Detail View fields
        $scope.fieldDisabled = true;
        $scope.buttonOneFunction = $scope.editDetail;
        $scope.buttonOneName = 'Edit';
        $scope.buttonTwoFunction = $scope.goBack;
        $scope.buttonTwoName = 'Done';

        TmtViews.getViewDataItem(userId,viewId,dataId,function(err){
            if (err)
                $scope.errorMessage = TmtUtilities.parseErrorMessage(err);
            else {
                $scope.errorMessage = '';
                $scope.editableDataItem = TmtViews.getEditableFormattedItem();
            }
        });
    })

.controller('editDetailController',
     function ($scope, $routeParams, TmtViews, TmtUtilities) {
         $scope.setStatusMessage('');
         $scope.setShowingCollection(true);
         var userId = $routeParams.userId;
         var viewId = $routeParams.viewId;
         var dataId = $routeParams.dataId;
         $scope.setMenu('tmt_detail_menu.html');

         $scope.saveDetail = function(){
             $scope.setStatusMessage('updating detail...');
             $scope.errorMessage = '';
             if (!$scope.detailsForm.$valid){
                 $scope.errorMessage = 'Please correct errors.';
                 return;
             }

             TmtViews.updateDataItem(userId,viewId,$scope.editableDataItem, function(err){
                 $scope.setStatusMessage('');
                 if (err){
                     $scope.errorMessage = TmtUtilities.parseErrorMessage(err);
                     return;
                 }
                 // update complete
                 $scope.goBack();
             })
         };

         // Set up Editable Detail View fields
         $scope.fieldDisabled = false;
         $scope.buttonOneFunction = $scope.saveDetail;
         $scope.buttonOneName = 'Save';
         $scope.buttonTwoFunction = $scope.goBack;
         $scope.buttonTwoName = 'Cancel';

        TmtViews.getViewDataItem(userId,viewId,dataId,function(err){
            if (err)
                $scope.errorMessage = TmtUtilities.parseErrorMessage(err);
            else {
                $scope.errorMessage = '';
                $scope.editableDataItem = TmtViews.getEditableFormattedItem();
                $scope.setStatusMessage('Update information then press "Save"');
            }
        });
    })
;








