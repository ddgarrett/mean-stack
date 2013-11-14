/*
    Display a List of Detail Items
 */
tmtModule
    .controller('listController', function ($scope, $routeParams, TmtViews, TmtUtilities) {
        $scope.setStatusMessage('');
        $scope.setShowingCollection(true);
        var userId = $routeParams.userId;
        var viewId = $routeParams.viewId;
        var pageNumber = $routeParams.pageNumber;
        if (pageNumber === undefined) pageNumber = '0';

        TmtViews.getPage(userId,viewId,pageNumber,function(err){
            if (err)
                $scope.errorMessage = TmtUtilities.parseErrorMessage(err);
            else {
                $scope.errorMessage = '';
                $scope.setMenu('tmt_list_menu.html');
            }
        })
    })
;