// Read a data file that consists of tab delmited rows

var fs = require('fs');  // file system

exports.readData = function(fileName){
    var data = fs.readFileSync(fileName);
    var dataString = new String(data);
    var dataLines = dataString.split('\n');

        // turn each line into an array
    for (var i=0; i < dataLines.length; ++i){
      // remove any \r
      var j = dataLines[i].indexOf('\r');
      if (j >= 0) dataLines[i] = dataLines[i].substring(0,j);
      
      var dataLine = dataLines[i].split('\t'); 
      dataLines[i] = dataLine;
    }
    
    return parseTabData(dataLines);
};

// Assuming that the first row of an array is the field names
// put the tab delimited data into a hashmap
function parseTabData(dataLines){
    // field names in row 0
    var header = dataLines[0];
    
    // Array of hashmaps (output)
    var hashArray = new Array();
    
    for (var i=1; i < dataLines.length; ++i){
      var dataLine = dataLines[i];
      docHash = new Object();
      for (var j=0; j < header.length; ++j){
        if (j < dataLine.length){
          var value = dataLine[j].trim();
          if (value.length > 0) docHash[header[j]] = value;
        }
      }
      
      hashArray[i-1] = docHash;
    }

    return hashArray
};