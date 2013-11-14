// insert the definition for the views

var ml = require('./mongoLoad');
var rd = require('./readTabData');

// Create array of hashmaps for data file
var views = rd.readData('collection.views.data');

// add an array of fields for each collection
views.forEach( function(dataLine) {
   ml.convertIntegers(['_id'], dataLine);
   dataLine['fields'] = new Array();
});

// Now add the fields for each view

var viewFields  = rd.readData('collection.views.fields.data'); 

// given a view id, return the fields array
function getView(id){
  var result = undefined;
  var searchId = parseInt(id);
  for (i =0; i < views.length && result === undefined; ++i){
    var view = views[i];
    if (view['_id'] === searchId) result = view;
  };
  return result;
}

// build the array of fields for each view
viewFields.forEach( function(viewField) {
  var viewId = viewField['view'];
  delete viewField['view'];
  var view = getView(viewId);
  if (view === undefined){
    console.log('view not found for field: ' + viewId);
  }
  else {
    var fieldArray = view['fields'];
    fieldArray.push(viewField);
  }
});

// transform fields from an array of names to a single hashmap
// as needed by MongoDB
views.forEach( function(dataLine) {
   var fieldHashMap = new Object();
   var displayOrder = new Array();
   dataLine['fields'].forEach( function(field) {
     fieldHashMap[field.name] = 1;
     displayOrder.push(field.name);
   });
   dataLine['fields'] = fieldHashMap
   dataLine['displayOrder'] = displayOrder;
});

ml.insertDocs('views',views)





