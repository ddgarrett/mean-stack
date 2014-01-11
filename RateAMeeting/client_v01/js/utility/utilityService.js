/**
 * Created by dgarrett on 11/21/13.
 */

RamModule.factory('utilityService', function() {
    var utilityService = {};

    // Create a "deep" copy of an object.
    // Serialize it to JSON, then create a new object by parsing the JSON
    // TODO: check out - possible problem with Dates?
    utilityService.cloneJsonObject = function(o){
        return JSON.parse(JSON.stringify(o));
    };

    utilityService.removeNonNumeric = function(string){
        var stringConvert = '';
        for (var i=0; i < string.length; ++i){
            if (string.substr(i,1) >= '0' && string.substr(i,1) <= '9'){
                stringConvert += string.substr(i,1);
            }
        }

        if (stringConvert.length === 0) return '0';
        return stringConvert;
    };

    // Parse the results of an error passed back from the Server
    utilityService.parseErrorMessage = function(err){
        if (err != undefined){
            if (err.errMsg !== undefined)
                return err.errMsg;

            if (err.data !== undefined && err.data.errMsg !== undefined){
                return err.data.errMsg;
            }
        }
        return 'Error contacting server. Please try again later...';
    };

    // Build a JSON object with only updated fields
    utilityService.parseUpdates = function(dataBefore,dataAfter,updateFields){
        var results = {};
        results.errors = [];
        results.updateData = {};
        results.dataUpdated = false;

        updateFields.forEach(function(field){
            if (field.editable){
                compareBeforeAndAfter(dataBefore,dataAfter,field,results);
            }
        });

        return results;
    };

    // Local function to compare before and after versions of a field
    var compareBeforeAndAfter = function(dataBefore,dataAfter,field,results){
        var fieldBefore = '';
        var fieldAfter  = '';

        if (dataBefore[field.name]) fieldBefore = dataBefore[field.name].trim();
        if (dataAfter[field.name])  fieldAfter  = dataAfter[field.name].trim();

        if (fieldBefore !== fieldAfter){
            results.dataUpdated = true;
            results.updateData[field.name] = fieldAfter;

            var parser = utilityService.parser[field.type];
            if (parser) parser(results.updateData,field);

            if (field.required && fieldAfter.length === 0){
                results.errors.push('Missing required field '+field.header);
            }
        }
    };
    /*********************************************************************************************************
     Various parser
     NOTE: only need a parser if the value has to be converted to another format before sending to server
     *********************************************************************************************************/
    utilityService.parseDisplay = function(data,fields){
        fields.forEach(function(field){
            var parser = utilityService.parser[field.type];
            if (parser)
                parser(data,field)
        });
    };

    utilityService.parser = {};

    // create a date and set time to noon before sending to server
    utilityService.parser.date = function(row,field){
        var value = row[field.name];
        if (typeof value !== 'string'
            || value.trim().length === 0) return;

        value = new Date(value);
        value.setHours(12);
        row[field.name] = value;
    };


    /*********************************************************************************************************
            Various formatter
            NOTE: only need a formatter if the value has to be calculated or transformed to a string
     *********************************************************************************************************/

    utilityService.formatDisplay = function(data,fields){
        data.forEach(function(row){
            fields.forEach(function(field){
                var formatter = utilityService.format[field.type];
                if (formatter)
                    formatter(row,field)
            });
        });
    };

    utilityService.format = {};

    utilityService.format.date = function(row,field){
        var value = row[field.name];
        row[field.name] = '';

        if (value === undefined) return;
        if (typeof value === 'string' && value.trim().length === 0) return;

        var d = new Date(value);
        var currDate  = utilityService.padNumber((d.getDate()),2);
        var currMonth = utilityService.padNumber((d.getMonth()+1),2);
        var currYear  = utilityService.padNumber(d.getFullYear(),4);
        row[field.name] =  currMonth + "/" + currDate + '/' + currYear;
    };

    utilityService.format.meetingNumber = function(row,field){
        var value = row['voteId'];
        row[field.name] = '';
        if (!value) return;
        var voteId = utilityService.padNumber(value,6);
        row[field.name] = voteId.substring(0,3) + '-' + voteId.substring(3)
    };

    utilityService.format.voteLink = function(row,field){
        var value =  row['voteId'];
        row[field.name] = '';
        if (!value) return;
        row[field.name] = '#/vote/' + value;
    };

    utilityService.format.calcVotes = function(row,field){
        row[field.name] = '0';
        var voteList = row['voteList'];
        if (!voteList || voteList.length === 0) return;
        row[field.name] = '' + voteList.length;
    };

    utilityService.format.calcRating = function(row,field){
        row[field.name] = '';
        var voteList = row['voteList'];
        if (!voteList || voteList.length === 0) return;
        var total = 0;
        var count = voteList.length;
        voteList.forEach(function(vote){
            if (vote.value) total += vote.value;
        });

        var calc = (total/count);
        row[field.name] = '' + calc.toFixed(1);
    };

    utilityService.padNumber = function (number, width) {
        var result = '' + number;
        while (result.length < width) {
            result = '0' + result;
        }
        return result;
    };

    return utilityService;
});