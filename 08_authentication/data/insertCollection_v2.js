var fs = require('fs');  // file system
var ml = require('./mongoLoad');

var data = fs.readFileSync('collection.trains.data');
var dataString = new String(data);
var dataLines = dataString.split('\n');

// remove any \r
for (var i=0; i < dataLines.length; ++i){
  var j = dataLines[i].indexOf('\r');
  if (j >= 0) dataLines[i] = dataLines[i].substring(0,j);
}

// split first line on tabs to get column header
var header = dataLines[0].split('\t');

// Array of load documents
var hashArray = new Array();

for (var i=1; i < dataLines.length; ++i){
  var dataLine = dataLines[i].split('\t');
  docHash = new Object();
  for (var j=0; j < header.length; ++j){
    if (j < dataLine.length){
      var value = dataLine[j].trim();
      if (value.length > 0) docHash[header[j]] = value;
    }
    ml.convertCurrency(['cost', 'value', 'priceOffer', 'saleBase', 'salesTax'], docHash);
    ml.convertBooleans(['forSale','wishList'], docHash);
    ml.convertDates(['purchDt'], docHash);
  }
  
  hashArray[i-1] = docHash;
}

ml.insertDocs('trains',hashArray)





