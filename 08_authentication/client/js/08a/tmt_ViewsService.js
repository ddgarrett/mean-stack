/*
    Views Service

    Factory to return an object needed to
    show views of data.

 */
//noinspection JSUnresolvedFunction
tmtModule.factory('TmtViews', function($http, TmtUsers, TmtUtilities) {
    var TmtViews = {};

    // define Views properties, including functions
    TmtViews.rowsPerPage = 8;
    TmtViews.pagesPerBlock = 5;

    TmtViews.resetCache = function(){
        TmtViews.viewDef = undefined;
        TmtViews.currentCollection = undefined;
        TmtViews.currentView = undefined;
        TmtViews.collData = undefined;          // collection data via current view
        TmtViews.dataItem = undefined;          // single item read via current view

        TmtViews.rowCount = 0;                  // Number of rows in current view
        TmtViews.currentPage = 0;
        TmtViews.pageList = [];                 // Array defining the paging blocks
    };

    TmtViews.resetCache();

    // Read a given view
    TmtViews.getView = function(userId,viewId,callback){
        TmtUsers.getUser(userId, function(err){
            if (err){
                console.log('getView get User err: '+err);
                TmtViews.resetCache();
                callback(err);
                return;
            }
            // if we've already read the view, return
            if (TmtViews.viewDef &&  TmtViews.viewDef._id == viewId) {
                callback(undefined);
                return;
            }

            TmtViews.resetCache();

            // read the definition of the view
            //noinspection JSUnresolvedFunction
            $http.get('api/users/'+userId+'/views/'+viewId+'/def')
                .success(function(data, status, headers, config){
                    TmtViews.viewDef = data;
                    TmtViews.currentCollection = TmtUtilities.findInArray(TmtUsers.user.collections,data.collection);
                    TmtViews.currentView = TmtUtilities.findInArray(TmtViews.currentCollection.views,viewId);

                    // read the count of total number of rows in view
                    //noinspection JSUnresolvedFunction
                    $http.get('api/users/'+userId+'/views/'+viewId+'/data/count')
                        .success(function(data, status, headers, config){
                            TmtViews.rowCount = data.count;
                            callback(undefined);
                        })
                        .error(function(data, status, headers, config) {
                            console.log('error on read of data count ' + viewId);
                            callback({data: data, status:status, headers: headers, config :config})
                        });
                })
                .error(function(data, status, headers, config) {
                    console.log('error on read of View Def ' + userId);
                    callback({data: data, status:status, headers: headers, config :config})
                });
        });
    };

    // Read a page of data
    TmtViews.getPage = function(userId, viewId, page, callback){
        TmtViews.getView(userId,viewId, function(err){
            if (err){
                console.log('system error: '+err);
                TmtViews.resetCache();
                callback(err);
                return;
            }

            var skip = page * TmtViews.rowsPerPage;
            //noinspection JSUnresolvedFunction
            $http.get('api/users/'+userId+'/views/'+viewId+'/data/?skip='+skip+'&limit='+TmtViews.rowsPerPage)
                .success(function(data, status, headers, config){
                    TmtViews.collData = data;
                    TmtViews.currentPage = page;
                    TmtViews.buildPageList();
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {
                    console.log('error on read of Page ' + page + ' for view '+viewId);
                    callback(data);
                });
        });
    };

    TmtViews.buildPageList = function(){
        TmtViews.pageList = [];
        if (TmtViews.collData === undefined || TmtViews.rowCount == 0) return;

        // Block number that we're displaying - zero based
        var currBlock = Math.floor(TmtViews.currentPage/TmtViews.pagesPerBlock);
        var maxBlock = Math.floor((TmtViews.rowCount-1)/TmtViews.pagesPerBlock);
        currBlock = Math.min(currBlock,maxBlock);

        var maxPage = Math.floor((TmtViews.rowCount-1)/TmtViews.rowsPerPage);

        var linkPrefix = '/app/users/' + TmtUsers.user._id + '/views/' + TmtViews.viewDef._id  + '/pages/';
        var blockPage = (currBlock * TmtViews.pagesPerBlock) - 1;

        for (var i=0; i <= TmtViews.pagesPerBlock + 1; ++i){
            var pageObj = {myValue : (blockPage+1), myClass : '', myLink : (linkPrefix + (blockPage))};

            if (TmtViews.currentPage == blockPage){
                pageObj.myClass = 'active';
            }

            if (blockPage < 0){
                pageObj.myClass = 'disabled';
                pageObj.myLink = linkPrefix + 0;
            }

            if (blockPage > maxPage){
                pageObj.myClass = 'disabled';
                pageObj.myLink = linkPrefix + maxPage;
            }

            TmtViews.pageList[i] = pageObj;
            ++blockPage
        }

        // change displayed value for first and last blocks to be << and >>
        TmtViews.pageList[0].myValue = '\u00ab';
        TmtViews.pageList[TmtViews.pagesPerBlock + 1].myValue = '\u00bb';
    };

    // Read a single item via a view
    TmtViews.getViewDataItem = function(userId, viewId, dataId, callback){
        TmtViews.getView(userId,viewId, function(err){
            if (err){
                console.log('system error: '+err);
                TmtViews.resetCache();
                callback(err);
                return;
            }

            // Check for item recently read
            if (TmtViews.dataItem !== undefined
                && TmtViews.dataItem._id === dataId){
                callback(undefined);
                return;
            }

            //noinspection JSUnresolvedFunction
            $http.get('api/users/'+userId+'/views/'+viewId+'/data/'+dataId)
                .success(function(data, status, headers, config){
                    TmtViews.dataItem = data;
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {
                    console.log('error on read of Data Item ' + dataId + ' for view '+viewId );
                    callback(data);
                });
        });
    };

    // Return a "display" version of the currently cached TmtViews.dataItem
    TmtViews.getDisplayFormattedItem = function(){
        if (TmtViews.dataItem === undefined) return undefined;

        // Always keep _id value
        var formattedData = {_id:TmtViews.dataItem._id};

        TmtViews.viewDef.displayFields.forEach(function(fieldDef){
            var value = TmtViews.dataItem[fieldDef.name];
            formattedData[fieldDef.name] = TmtUtilities.formatField(value,fieldDef);
        });

        return formattedData;

    };

    // Return an "editable" version of the currently cached TmtViews.dataItem
    TmtViews.getEditableFormattedItem = function () {
        if (TmtViews.dataItem === undefined) return undefined;

        // Always keep _id value
        var formattedData = {_id:TmtViews.dataItem._id};

        TmtViews.viewDef.displayFields.forEach(function(fieldDef){
            var value = TmtViews.dataItem[fieldDef.name];
            formattedData[fieldDef.name] = TmtUtilities.formatEditableField(value,fieldDef);
        });

        return formattedData;
    };

    // Copy fields from editableDataItem to parsedData,
    // using the list fields in dislayFields.
    // Perform basic edits and set an errorMessage in resp if there is an error
    TmtViews.parseInputData = function(editableDataItem, parsedData, displayFields){
        var response = {};
        response.err = [];

        displayFields.forEach(function(fieldDef){
            var value = editableDataItem[fieldDef.name];
            parsedValue = TmtUtilities.parseField(value,fieldDef);

            if (parsedValue === undefined && fieldDef.required) {
                response.err.push('required field, "' + fieldDef.header + '" has not been entered');
            }
            else
            if (parsedValue !== TmtViews.dataItem[fieldDef.name]){
                // console.log('previous value: '+TmtViews.dataItem[fieldDef.name]+', new value: '+parsedValue);
                if (fieldDef.editable) {
                    response.modified = true;
                    // if value undefined, return empty string so we know to do an $unset
                    if (parsedValue === undefined) parsedValue = '';
                    parsedData[fieldDef.name] = parsedValue;
                } else {
                    response.err.push('field "' + fieldDef.header + '" is not allowed to be changed');
                }
            }
        });

        return response;
    };

    // Updates data in DB after performing edits
    TmtViews.updateDataItem = function(userId, viewId, editableDataItem, callback){
        if (!editableDataItem || !editableDataItem._id){
            callback (TmtUtilities.buildError('invalid data passed to updateDataItem'));
            return;
        }

        // Make sure we have read this data item
        TmtViews.getViewDataItem(userId, viewId, editableDataItem._id, function(err){
            if (err){
                callback(err);
                return;
            }

            var parsedData = {_id : TmtViews.dataItem._id }; // always pass back ID
            var response = TmtViews.parseInputData(editableDataItem,parsedData,TmtViews.viewDef.displayFields);
            if (response.err.length > 0){
                callback(TmtUtilities.buildError(response.err[0]));
                return;
            }

            if (!response.modified){
                callback(undefined);
                return;
            }

            // Perform REST call to Put Data Item
            TmtViews.dataItem = undefined; // force reread of item, next time we access it
            var config =
            {method: 'PUT',  url: '/api/users/'+userId+'/views/'+viewId+'/data/'+editableDataItem._id,
                data: parsedData,
                timeout: 10000 };  // want to set the timeout to 10 seconds

            $http(config)
                .success(function(data, status, headers, config) {
                    callback(undefined);
                })
                .error(function(data, status, headers, config) {
                    callback({data: data, status:status, headers: headers, config :config})
                });
        });
    };
    return TmtViews;
});
