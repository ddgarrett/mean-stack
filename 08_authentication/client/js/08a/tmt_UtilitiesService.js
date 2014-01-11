
/*
 Utilities Service

 Factory - Return an instance of a Utilities Service
 which contains misc. global functions.

 */
tmtModule.factory('TmtUtilities', function() {
    var TmtUtilities = {};

    // Create a "deep" copy of an object.
    // Serialize it to JSON, then create a new object by parsing the JSON
    TmtUtilities.cloneJsonObject = function(o){
        return JSON.parse(JSON.stringify(o));
    };

    // Given an array of Objects,
    // find the entry who's _id == the _id passed.
    TmtUtilities.findInArray = function(array,_id){
        if (array === undefined || _id === undefined) return undefined;
        for (var i=0; i < array.length && array[i]._id != _id; ++i){}
        if (i < array.length) return array[i];
        return undefined;
    };

    // Parse the results of an error passed back from the Server
    TmtUtilities.parseErrorMessage = function(err){
        if (err == undefined || err.data === undefined || err.data.errMsg === undefined)
            return 'Error contacting server. Please try again later...';
        else
            return err.data.errMsg;
    };

    // Create a new error message block
    TmtUtilities.buildError = function(message){
        return {data : {error: true, errMsg: message}};
    };

    /************************************************************
        Various formatting functions
        NOTE: in general, we do NOT store blank strings and zero
     *************************************************************/
    TmtUtilities.fmt = {};
    TmtUtilities.parse = {};

    // no formatting needed for string
    TmtUtilities.fmt.string = function(value){
        if (value === undefined) return '';
        return value.toString();
    };
    TmtUtilities.parse.string = function(value){
        if (value === undefined) return undefined;
        var input = value.toString().trim();
        if (input.length === 0) return undefined;
        return input;
    };

    // format cents, nnnn, as dollars nn.nn
    TmtUtilities.fmt.money = function(value){
        if (value === undefined) return '';

        var number = value;
        if (typeof value !== 'number'){
            number = parseInt(value,10);
        }

        if (number === 0) return '';

        return  (number/100).toFixed(2);
    };
    TmtUtilities.parse.money = function(value){
        if (value === undefined) return undefined;
        var input = value;
        if (typeof input !== 'number'){
            input = parseFloat(input);
        }
        if (input === 0) return undefined;
        input = parseInt((input*100).toFixed(0));
        if (isNaN(input)){
            return undefined;
        }
        return input;
    };

    // format date
    TmtUtilities.fmt.date = function(value){
        if (value === undefined) return '';
        if (typeof value === 'string' && value.trim().length === 0) return '';

        var d = new Date(value);
        var currDate  = TmtUtilities.padNumber((d.getDate()),2);
        var currMonth = TmtUtilities.padNumber((d.getMonth()+1),2);
        var currYear  = TmtUtilities.padNumber(d.getFullYear(),4);
        var result =  currMonth + "/" + currDate + '/' + currYear;
        // console.log('fmt.date, input:'+value+", output:"+result);
        return result;
    };
    TmtUtilities.parse.date = function(value){
        var result = undefined;
        if (typeof value === 'date')  result = value.toJSON();
        if (typeof value === 'string' && value.trim().length !== 0){
            result = (new Date(value));
            result.setHours(12);  // set to noon to help with other time zones
            result = result.toISOString();
        }
        // console.log('parse.date, input:'+value+', typof value:'+(typeof value) + ', output:'+result);
        return result;
    };

    // format boolean
    TmtUtilities.fmt.boolean = function(value){
        if (typeof value === 'boolean') return (value? 'Yes':'No');
        return (TmtUtilities.parse.boolean(value) ? 'Yes' : 'No');
    };
    TmtUtilities.parse.boolean = function(value){
        if (value === undefined) return false;
        var input = value;
        if (typeof input === 'string' ) input = input.toLowerCase().trim();
        if (typeof input === 'number' && input > 0) return true;
        return [true,'true', 't', 'yes', 'y', '1'].indexOf(input) >= 0;
    };

    // format id
    TmtUtilities.fmt.id = function(value){
        return value;
    };
    TmtUtilities. parse.id = function(value){
        return value;
    };

    // External function for formatting and parsing field values
    // Format display version of field
    TmtUtilities.formatField = function(value,def){
        return TmtUtilities.fmt[def.type](value);
    };

    // Just in case we ever have a different format for editable
    // versus read only display of a field.
    TmtUtilities.formatEditableField = TmtUtilities.formatField;

    TmtUtilities.parseField = function(value,def){
        return TmtUtilities.parse[def.type](value);
    };

    // Add 0 in front of a number until it is a specified width
    TmtUtilities.padNumber = function (number, width) {
        var result = '' + number;
        while (result.length < width) {
            result = '0' + result;
        }
        return result;
    };

    return TmtUtilities;
});