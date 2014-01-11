var config = require('./config.json');
var MongoClient = require('mongodb').MongoClient;

exports.insertDocs = function(collectionName, documents){
  MongoClient.connect(config.mongoDB.connectionString, function(err, db) {
      if (err) throw err;
      var collection = db.collection(collectionName);
      console.log('remove all documents in ' + collectionName);
      // remove all existing documents
      collection.remove({}, {w:1}, function(err, result) {
         if (err) {
            console.log('error on remove of documents: ' + err);
            db.close();
         }
         else {
            console.log('documents deleted from ' + collectionName + '. result: ' + result);
            doInserts(db,collection,documents,collectionName);
         }
      });
    });
};

// insert the trains into a collection
function doInserts(db, collection, documents, collectionName) {
  // Insert new documents
  console.log('insert documents for ' + collectionName);
  collection
    .insert(documents,{w:1}, function(err, result) {
       if (err) {
          console.log('insert errorerror: ' + err);
       }
       else {
         console.log('documents inserted from ' + collectionName);
         console.log(collectionName + ' response: ' + result);
       }
       db.close();
     });
};

// Convert Currency from string to cents
// Must have a decimal point with two digit "cents": nn.nn
exports.convertCurrency = function(attributes,document){
    attributes.forEach(function(attribute){
      var value = document[attribute];
      if (value !== undefined){
        value = new String(value);
        var decPoint = value.indexOf('.');
        if (decPoint >= 0){
          value = value.substring(0,decPoint)
                + value.substring(decPoint+1);
          document[attribute] = parseInt(value,10);
        }
        else {
        }
      }
  });

}

// Convert a 'TRUE' or 'FALSE' to true / false
exports.convertBooleans =  function(attributes,document){
  attributes.forEach(function(attribute){
      var value = document[attribute];
      if (value !== undefined){
        if (value == 'TRUE') document[attribute] = true;
        else document[attribute] = false;
      }
  });
}

// convert dates
exports.convertDates = function(attributes,document){
  attributes.forEach(function(attribute){
      var value = document[attribute];
      if (value !== undefined){
         document[attribute] = new Date(value);
      }
  });
}

// convert integers
exports.convertIntegers = function(attributes,document){
  attributes.forEach(function(attribute){
      var value = document[attribute];
      if (value !== undefined){
         document[attribute] = parseInt(value);
      }
  });
}