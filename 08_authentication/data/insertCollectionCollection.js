// insert the definition for the collections

var ml = require('./mongoLoad');
var rd = require('./readTabData');

// Create array of hashmaps for data file
var collections = rd.readData('collections.data');

// add an array of fields for each collection
collections.forEach( function(dataLine) {
   dataLine['fields'] = new Array();
});

// Now add the fields for each collection

var collectionFields  = rd.readData('collection.fields.data'); 

// given a collection id, return the fields array
function getCollection(id){
  var result = undefined;
  for (i =0; i < collections.length && result === undefined; ++i){
    var collection = collections[i];
    if (collection['_id'] === id) result = collection;
  };
  return result;
}

// build the array of fields for each collection
collectionFields.forEach( function(collectionField) {
  var collectionId = collectionField['collection'];
  delete collectionField['collection'];
  var fields = getCollection(collectionId);
  if (fields === undefined){
    console.log('collection not found for field: ' + collectionId);
  }
  else {
    ml.convertBooleans(['required','editable'],collectionField);
    var fieldArray = getCollection(collectionId)['fields'];
    fieldArray.push(collectionField);
  }
});


ml.insertDocs('collections',collections)





